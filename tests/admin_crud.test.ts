import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { initSchema, setDatabase } from "../src/db";
import { seedAdminUser } from "../src/db/seed";
import { authRoute } from "../src/routes/admin/auth";
import { adminEventsRoute } from "../src/routes/admin/events";
import { adminUsersRoute } from "../src/routes/admin/users";
import { adminAttendancesRoute } from "../src/routes/admin/attendances";
import { createSessionToken } from "../src/utils/auth";
import { EventService } from "../src/services/event.service";
import { UserService } from "../src/services/user.service";
import { AttendanceService } from "../src/services/attendance.service";

describe("Admin Modules & Full CRUD Operations", () => {
  let db: Database;
  let app: Hono;
  let adminCookie: string;
  let staffCookie: string;

  beforeEach(async () => {
    db = new Database(":memory:");
    db.run("PRAGMA foreign_keys = ON;");
    setDatabase(db);
    initSchema(db);
    seedAdminUser(db);

    // Create session token for ADMIN
    const adminUser = db
      .prepare("SELECT * FROM users WHERE identifier = '00000000'")
      .get() as { id: number; identifier: string; full_name: string; role: "ADMIN" };

    const adminToken = await createSessionToken({
      id: adminUser.id,
      identifier: adminUser.identifier,
      full_name: adminUser.full_name,
      role: adminUser.role,
    });
    adminCookie = `auth_session=${adminToken}`;

    // Create a STAFF user and session
    const staffUser = await UserService.create({
      identifier: "12345678",
      full_name: "Staff Coordinador",
      password: "password123",
      role: "STAFF",
    });

    const staffToken = await createSessionToken({
      id: staffUser.id,
      identifier: staffUser.identifier,
      full_name: staffUser.full_name,
      role: staffUser.role,
    });
    staffCookie = `auth_session=${staffToken}`;

    // Create the test app
    app = new Hono();
    app.route("/", authRoute);
    app.route("/admin", adminEventsRoute);
    app.route("/admin", adminUsersRoute);
    app.route("/admin", adminAttendancesRoute);
  });

  afterEach(() => {
    db.close();
    setDatabase(null);
  });

  describe("Dashboard Dual View (Cards vs Table)", () => {
    it("GET /admin should render Cards view by default", async () => {
      const res = await app.request("/admin", {
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain("Eventos Registrados");
      expect(html).toContain("Tarjetas");
      expect(html).toContain("Tabla");
    });

    it("GET /admin?view=table should render Table view with table markup", async () => {
      EventService.create({
        title: "Evento Vista Tabla",
        location_name: "Sede Central",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 100,
      });

      const res = await app.request("/admin?view=table", {
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain("<table");
      expect(html).toContain("Evento Vista Tabla");
      expect(html).toContain("Sede Central");
    });
  });

  describe("Event CRUD Operations", () => {
    it("GET /admin/events/:id should render Event Detail view with attendee info", async () => {
      const event = EventService.create({
        title: "Evento con Detalle",
        location_name: "Auditorio Magna",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 150,
      });

      // Register an attendance
      AttendanceService.register({
        eventPublicCode: event.public_code,
        dni: "87654321",
        latitude: -12.0463,
        longitude: -77.0427,
        accuracy: 5,
      });

      const res = await app.request(`/admin/events/${event.id}`, {
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain("Evento con Detalle");
      expect(html).toContain("Auditorio Magna");
      expect(html).toContain("87654321");
      expect(html).toContain("/asistir/" + event.public_code);
    });

    it("GET /admin/events/:id/edit should render event edit form with prefilled values", async () => {
      const event = EventService.create({
        title: "Evento Para Editar",
        location_name: "Sala de Conferencias",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 80,
      });

      const res = await app.request(`/admin/events/${event.id}/edit`, {
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain("Editar Evento");
      expect(html).toContain("Evento Para Editar");
      expect(html).toContain("Sala de Conferencias");
      expect(html).toContain("value=\"80\"");
    });

    it("POST /admin/events/:id/edit should successfully update event details", async () => {
      const event = EventService.create({
        title: "Título Original",
        location_name: "Lugar Original",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 100,
      });

      const formData = new FormData();
      formData.append("title", "Título Modificado");
      formData.append("location_name", "Lugar Modificado");
      formData.append("latitude", "-12.0500");
      formData.append("longitude", "-77.0500");
      formData.append("radius_meters", "200");
      formData.append("status", "CLOSED");

      const res = await app.request(`/admin/events/${event.id}/edit`, {
        method: "POST",
        headers: { Cookie: adminCookie },
        body: formData,
      });

      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toBe(`/admin/events/${event.id}?notice=Evento+actualizado+exitosamente`);

      // Verify in DB
      const updated = EventService.getById(event.id);
      expect(updated?.title).toBe("Título Modificado");
      expect(updated?.location_name).toBe("Lugar Modificado");
      expect(updated?.radius_meters).toBe(200);
      expect(updated?.status).toBe("CLOSED");
    });

    it("POST /admin/events/:id/delete should delete event and related attendances", async () => {
      const event = EventService.create({
        title: "Evento a Borrar",
        location_name: "Lugar",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 100,
      });

      AttendanceService.register({
        eventPublicCode: event.public_code,
        dni: "77778888",
        latitude: -12.0463,
        longitude: -77.0427,
        accuracy: 4,
      });

      const res = await app.request(`/admin/events/${event.id}/delete`, {
        method: "POST",
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toBe("/admin?notice=Evento+eliminado+exitosamente");

      // Verify it's gone from DB
      const found = EventService.getById(event.id);
      expect(found).toBeNull();
    });
  });

  describe("Coordinators / Users Management (/admin/users)", () => {
    it("GET /admin/users should list all users", async () => {
      const res = await app.request("/admin/users", {
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain("Coordinadores y Personal");
      expect(html).toContain("00000000");
      expect(html).toContain("12345678");
      expect(html).toContain("Staff Coordinador");
    });

    it("POST /admin/users should create a new coordinator with valid data", async () => {
      const formData = new FormData();
      formData.append("identifier", "88889999");
      formData.append("full_name", "Nuevo Coordinador");
      formData.append("password", "secreto123");
      formData.append("role", "STAFF");

      const res = await app.request("/admin/users", {
        method: "POST",
        headers: { Cookie: adminCookie },
        body: formData,
      });

      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toContain("/admin/users?notice=");

      // Verify user exists in database
      const user = UserService.getByIdentifier("88889999");
      expect(user).not.toBeNull();
      expect(user?.full_name).toBe("Nuevo Coordinador");
      expect(user?.role).toBe("STAFF");
      expect(user?.status).toBe("ACTIVE");
    });

    it("POST /admin/users should reject invalid DNI format with 400", async () => {
      const formData = new FormData();
      formData.append("identifier", "123"); // only 3 digits
      formData.append("full_name", "Nombre Invalido");
      formData.append("password", "secreto123");

      const res = await app.request("/admin/users", {
        method: "POST",
        headers: { Cookie: adminCookie },
        body: formData,
      });

      expect(res.status).toBe(400);
      const html = await res.text();
      expect(html).toContain("El DNI debe tener exactamente 8 dígitos numéricos");
    });

    it("POST /admin/users/:id/toggle should toggle user status between ACTIVE and INACTIVE", async () => {
      const staff = UserService.getByIdentifier("12345678")!;
      expect(staff.status).toBe("ACTIVE");

      const res = await app.request(`/admin/users/${staff.id}/toggle`, {
        method: "POST",
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(302);
      const updated = UserService.getById(staff.id);
      expect(updated?.status).toBe("INACTIVE");
    });

    it("POST /admin/users/:id/delete should delete user", async () => {
      const staff = UserService.getByIdentifier("12345678")!;

      const res = await app.request(`/admin/users/${staff.id}/delete`, {
        method: "POST",
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(302);
      const found = UserService.getById(staff.id);
      expect(found).toBeNull();
    });

    it("POST /admin/users/:id/delete should protect superadmin from deletion", async () => {
      const admin = UserService.getByIdentifier("00000000")!;

      const res = await app.request(`/admin/users/${admin.id}/delete`, {
        method: "POST",
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toContain("error=");

      const stillThere = UserService.getByIdentifier("00000000");
      expect(stillThere).not.toBeNull();
    });
  });

  describe("Global Attendances Management (/admin/attendances)", () => {
    it("GET /admin/attendances should display all attendances across events", async () => {
      const event = EventService.create({
        title: "Evento Global",
        location_name: "Sede Sur",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 100,
      });

      AttendanceService.register({
        eventPublicCode: event.public_code,
        dni: "44445555",
        latitude: -12.0463,
        longitude: -77.0427,
        accuracy: 3,
      });

      const res = await app.request("/admin/attendances", {
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain("Registro Global de Asistencias");
      expect(html).toContain("44445555");
      expect(html).toContain("Evento Global");
      expect(html).toContain("Exportar CSV");
    });

    it("GET /admin/attendances/export should download a valid CSV file", async () => {
      const event = EventService.create({
        title: "Evento Para Exportar",
        location_name: "Sede Este",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 100,
      });

      AttendanceService.register({
        eventPublicCode: event.public_code,
        dni: "99990000",
        latitude: -12.0463,
        longitude: -77.0427,
        accuracy: 2,
      });

      const res = await app.request("/admin/attendances/export", {
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/csv");
      expect(res.headers.get("content-disposition")).toContain("attachment; filename=");

      const csv = await res.text();
      expect(csv).toContain("ID,DNI,Evento,Codigo_Evento,Fecha_Hora,Distancia_Metros,Precision_Metros,Metodo,Direccion_IP");
      expect(csv).toContain("99990000");
      expect(csv).toContain("Evento Para Exportar");
    });
  });

  describe("Role Permissions & Access Control (STAFF vs ADMIN)", () => {
    it("STAFF cannot access /admin/users (403 Forbidden)", async () => {
      const res = await app.request("/admin/users", {
        headers: { Cookie: staffCookie },
      });

      expect(res.status).toBe(403);
    });

    it("STAFF cannot access /admin/events/:id/edit (403 Forbidden)", async () => {
      const event = EventService.create({
        title: "Evento Protegido",
        location_name: "Lugar",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 100,
      });

      const res = await app.request(`/admin/events/${event.id}/edit`, {
        headers: { Cookie: staffCookie },
      });

      expect(res.status).toBe(403);
    });

    it("STAFF cannot delete events (403 Forbidden)", async () => {
      const event = EventService.create({
        title: "Evento No Borrable por Staff",
        location_name: "Lugar",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 100,
      });

      const res = await app.request(`/admin/events/${event.id}/delete`, {
        method: "POST",
        headers: { Cookie: staffCookie },
      });

      expect(res.status).toBe(403);
    });
  });
});
