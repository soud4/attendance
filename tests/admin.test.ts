import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { initSchema, setDatabase } from "../src/db";
import { seedAdminUser } from "../src/db/seed";
import { authRoute } from "../src/routes/admin/auth";
import { adminEventsRoute } from "../src/routes/admin/events";
import { createSessionToken } from "../src/utils/auth";

describe("Admin Authentication & Event Management", () => {
  let db: Database;
  let app: Hono;
  let adminSessionCookie: string;

  beforeEach(async () => {
    db = new Database(":memory:");
    db.run("PRAGMA foreign_keys = ON;");
    setDatabase(db);
    initSchema(db);
    seedAdminUser(db);

    // Create session token for testing protected routes
    const adminUser = db
      .prepare("SELECT * FROM users WHERE identifier = '00000000'")
      .get() as { id: number; identifier: string; full_name: string; role: "ADMIN" | "STAFF" };

    const token = await createSessionToken({
      id: adminUser.id,
      identifier: adminUser.identifier,
      full_name: adminUser.full_name,
      role: adminUser.role,
    });

    adminSessionCookie = `auth_session=${token}`;

    app = new Hono();
    app.route("/", authRoute);
    app.route("/admin", adminEventsRoute);
  });

  afterEach(() => {
    db.close();
    setDatabase(null);
  });

  describe("Authentication Flow (/login & /logout)", () => {
    it("GET /login should display login form for unauthenticated users", async () => {
      const res = await app.request("/login");
      expect(res.status).toBe(200);

      const html = await res.text();
      expect(html).toContain("Acceso al Panel");
      expect(html).toContain("DNI");
      expect(html).toContain("Contraseña");
      expect(html).toContain("name=\"identifier\"");
      expect(html).toContain("name=\"password\"");
    });

    it("GET /login should redirect to /admin if user already has a valid session", async () => {
      const res = await app.request("/login", {
        headers: { Cookie: adminSessionCookie },
      });
      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toBe("/admin");
    });

    it("POST /login should reject non-8-digit DNI with 400", async () => {
      const formData = new FormData();
      formData.append("identifier", "12345"); // Invalid DNI length
      formData.append("password", "admin123");

      const res = await app.request("/login", {
        method: "POST",
        body: formData,
      });

      expect(res.status).toBe(400);
      const html = await res.text();
      expect(html).toContain("El DNI debe contener exactamente 8 dígitos numéricos");
    });

    it("POST /login should reject missing password with 400", async () => {
      const formData = new FormData();
      formData.append("identifier", "00000000");
      formData.append("password", "");

      const res = await app.request("/login", {
        method: "POST",
        body: formData,
      });

      expect(res.status).toBe(400);
      const html = await res.text();
      expect(html).toContain("Por favor ingresa tu contraseña");
    });

    it("POST /login should reject incorrect password with 401", async () => {
      const formData = new FormData();
      formData.append("identifier", "00000000");
      formData.append("password", "wrongpass");

      const res = await app.request("/login", {
        method: "POST",
        body: formData,
      });

      expect(res.status).toBe(401);
      const html = await res.text();
      expect(html).toContain("DNI o contraseña incorrectos");
    });

    it("POST /login should succeed with valid credentials and set session cookie", async () => {
      const formData = new FormData();
      formData.append("identifier", "00000000");
      formData.append("password", "admin123");

      const res = await app.request("/login", {
        method: "POST",
        body: formData,
      });

      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toBe("/admin");

      const setCookie = res.headers.get("set-cookie") || "";
      expect(setCookie).toContain("auth_session=");
      expect(setCookie).toContain("HttpOnly");
    });

    it("POST /logout and GET /logout should clear session and redirect to /login", async () => {
      const resPost = await app.request("/logout", { method: "POST" });
      expect(resPost.status).toBe(302);
      expect(resPost.headers.get("location")).toBe("/login");
      expect(resPost.headers.get("set-cookie")).toContain("Max-Age=0");

      const resGet = await app.request("/logout", { method: "GET" });
      expect(resGet.status).toBe(302);
      expect(resGet.headers.get("location")).toBe("/login");
    });
  });

  describe("Protected Admin Dashboard (/admin)", () => {
    it("GET /admin should redirect unauthenticated request to /login", async () => {
      const res = await app.request("/admin");
      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toBe("/login");
    });

    it("GET /admin should render dashboard for authenticated admin", async () => {
      const res = await app.request("/admin", {
        headers: { Cookie: adminSessionCookie },
      });

      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain("Eventos Registrados");
      expect(html).toContain("Administrador Principal");
      expect(html).toContain("00000000");
      expect(html).toContain("Nuevo Evento");
    });
  });

  describe("Event Creation & Management (/admin/events)", () => {
    it("GET /admin/events/new should render event creation form", async () => {
      const res = await app.request("/admin/events/new", {
        headers: { Cookie: adminSessionCookie },
      });

      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain("Crear Evento");
      expect(html).toContain("Título");
      expect(html).toContain("Sede");
      expect(html).toContain("ubicación");
      expect(html).toContain("Radio");
    });

    it("POST /admin/events should reject missing title with 400", async () => {
      const formData = new FormData();
      formData.append("title", "");
      formData.append("location_name", "Auditorio Central");
      formData.append("latitude", "-12.046374");
      formData.append("longitude", "-77.042793");

      const res = await app.request("/admin/events", {
        method: "POST",
        headers: { Cookie: adminSessionCookie },
        body: formData,
      });

      expect(res.status).toBe(400);
      const html = await res.text();
      expect(html).toContain("Por favor ingresa el título del evento");
    });

    it("POST /admin/events should reject invalid coordinates with 400", async () => {
      const formData = new FormData();
      formData.append("title", "Reunión Directiva");
      formData.append("location_name", "Auditorio Central");
      formData.append("latitude", "999.0"); // invalid lat > 90
      formData.append("longitude", "-77.042793");

      const res = await app.request("/admin/events", {
        method: "POST",
        headers: { Cookie: adminSessionCookie },
        body: formData,
      });

      expect(res.status).toBe(400);
      const html = await res.text();
      expect(html).toContain("Coordenadas geográficas inválidas");
    });

    it("POST /admin/events should successfully create an event and redirect to /admin", async () => {
      const formData = new FormData();
      formData.append("title", "Asamblea de Delegados 2026");
      formData.append("location_name", "Estadio Manuel Bonilla");
      formData.append("latitude", "-12.1158");
      formData.append("longitude", "-77.0371");
      formData.append("radius_meters", "150");
      formData.append("starts_at", "09:00 AM");
      formData.append("ends_at", "01:00 PM");

      const res = await app.request("/admin/events", {
        method: "POST",
        headers: { Cookie: adminSessionCookie },
        body: formData,
      });

      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toContain("/admin?notice=");

      // Verify event in database
      const createdEvent = db
        .prepare("SELECT * FROM events WHERE title = 'Asamblea de Delegados 2026'")
        .get() as any;

      expect(createdEvent).toBeDefined();
      expect(createdEvent.location_name).toBe("Estadio Manuel Bonilla");
      expect(createdEvent.latitude).toBeCloseTo(-12.1158, 4);
      expect(createdEvent.longitude).toBeCloseTo(-77.0371, 4);
      expect(createdEvent.radius_meters).toBe(150);
      expect(createdEvent.status).toBe("OPEN");
      expect(createdEvent.public_code.startsWith("ev-")).toBe(true);
    });

    it("POST /admin/events/:id/toggle should toggle event status between OPEN and CLOSED", async () => {
      // Create initial event
      db.run(`
        INSERT INTO events (public_code, title, location_name, latitude, longitude, radius_meters, status)
        VALUES ('ev-toggle-test', 'Evento de Prueba Toggle', 'Sala A', -12.0, -77.0, 100, 'OPEN');
      `);

      const event = db
        .prepare("SELECT id, status FROM events WHERE public_code = 'ev-toggle-test'")
        .get() as { id: number; status: string };

      expect(event.status).toBe("OPEN");

      // 1st Toggle: OPEN -> CLOSED
      const resToggle1 = await app.request(`/admin/events/${event.id}/toggle`, {
        method: "POST",
        headers: { Cookie: adminSessionCookie },
      });
      expect(resToggle1.status).toBe(302);

      const closedEvent = db
        .prepare("SELECT status, closed_at FROM events WHERE id = $id")
        .get({ $id: event.id }) as any;
      expect(closedEvent.status).toBe("CLOSED");
      expect(closedEvent.closed_at).toBeDefined();

      // 2nd Toggle: CLOSED -> OPEN
      const resToggle2 = await app.request(`/admin/events/${event.id}/toggle`, {
        method: "POST",
        headers: { Cookie: adminSessionCookie },
      });
      expect(resToggle2.status).toBe(302);

      const openedEvent = db
        .prepare("SELECT status FROM events WHERE id = $id")
        .get({ $id: event.id }) as any;
      expect(openedEvent.status).toBe("OPEN");
    });
  });
});
