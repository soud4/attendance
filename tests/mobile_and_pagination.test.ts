import { describe, it, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { initSchema, setDatabase } from "../src/db";
import { seedAdminUser } from "../src/db/seed";
import { createSessionToken } from "../src/utils/auth";
import { UserService } from "../src/services/user.service";
import { EventService } from "../src/services/event.service";
import { AttendanceService } from "../src/services/attendance.service";
import { authRoute } from "../src/routes/admin/auth";
import { adminEventsRoute } from "../src/routes/admin/events";
import { adminUsersRoute } from "../src/routes/admin/users";
import { adminAttendancesRoute } from "../src/routes/admin/attendances";

describe("Mobile UI Optimization & Cursor Pagination", () => {
  let db: Database;
  let app: Hono;
  let adminCookie: string;

  beforeEach(async () => {
    db = new Database(":memory:");
    db.run("PRAGMA foreign_keys = ON;");
    setDatabase(db);
    initSchema(db);
    seedAdminUser(db);

    const adminUser = db
      .prepare("SELECT * FROM users WHERE identifier = '00000000'")
      .get() as { id: number; identifier: string; full_name: string; role: "ADMIN" };

    const token = await createSessionToken({
      id: adminUser.id,
      identifier: adminUser.identifier,
      full_name: adminUser.full_name,
      role: "ADMIN",
    });
    adminCookie = `auth_session=${token}`;

    app = new Hono();
    app.route("/", authRoute);
    app.route("/admin", adminEventsRoute);
    app.route("/admin", adminUsersRoute);
    app.route("/admin", adminAttendancesRoute);
  });

  describe("Service Cursor Pagination", () => {
    it("AttendanceService should support cursor and limit pagination", () => {
      const event = EventService.create({
        title: "Evento Pagination Test",
        location_name: "Auditorio A",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 200,
      });

      // Register 5 attendees
      const dnis = ["10000001", "10000002", "10000003", "10000004", "10000005"];
      for (const dni of dnis) {
        AttendanceService.register({
          eventPublicCode: event.public_code,
          dni,
          latitude: -12.0463,
          longitude: -77.0427,
          accuracy: 5,
        });
      }

      // Test page 1 with limit 2
      const page1 = AttendanceService.getAllWithEventInfo({ limit: 2 });
      expect(page1.length).toBe(2);
      expect(page1[0]!.dni).toBe("10000005");
      expect(page1[1]!.dni).toBe("10000004");

      // Test page 2 with cursor = page1[1].id
      const page2 = AttendanceService.getAllWithEventInfo({ cursor: page1[1]!.id, limit: 2 });
      expect(page2.length).toBe(2);
      expect(page2[0]!.dni).toBe("10000003");
      expect(page2[1]!.dni).toBe("10000002");

      // Test page 3 with cursor = page2[1].id
      const page3 = AttendanceService.getAllWithEventInfo({ cursor: page2[1]!.id, limit: 2 });
      expect(page3.length).toBe(1);
      expect(page3[0]!.dni).toBe("10000001");

      // Test getTotalCount
      const total = AttendanceService.getTotalCount();
      expect(total).toBeGreaterThanOrEqual(5);

      const eventTotal = AttendanceService.getTotalCount(event.id);
      expect(eventTotal).toBe(5);

      // Test getByEventId pagination
      const eventPage1 = AttendanceService.getByEventId(event.id, { limit: 2 });
      expect(eventPage1.length).toBe(2);
      expect(eventPage1[0]!.dni).toBe("10000005");
    });

    it("EventService should support cursor and limit pagination", () => {
      const initialTotal = EventService.getTotalCount();

      const ev1 = EventService.create({
        title: "Evento Alpha",
        location_name: "Sede 1",
        latitude: -12.0,
        longitude: -77.0,
        radius_meters: 100,
      });
      const ev2 = EventService.create({
        title: "Evento Beta",
        location_name: "Sede 2",
        latitude: -12.0,
        longitude: -77.0,
        radius_meters: 100,
      });

      expect(EventService.getTotalCount()).toBe(initialTotal + 2);

      const eventsPage = EventService.getAllWithStats({ limit: 1 });
      expect(eventsPage.length).toBe(1);
      expect(eventsPage[0]!.id).toBe(ev2.id);

      const eventsPage2 = EventService.getAllWithStats({ cursor: ev2.id, limit: 1 });
      expect(eventsPage2.length).toBe(1);
      expect(eventsPage2[0]!.id).toBe(ev1.id);
    });

    it("UserService should support cursor and limit pagination", async () => {
      const u1 = await UserService.create({
        identifier: "11223344",
        full_name: "Usuario Uno",
        password: "password123",
        role: "STAFF",
      });
      const u2 = await UserService.create({
        identifier: "55667788",
        full_name: "Usuario Dos",
        password: "password123",
        role: "STAFF",
      });

      expect(UserService.getTotalCount()).toBeGreaterThanOrEqual(3);

      const usersPage1 = UserService.getAll({ limit: 1 });
      expect(usersPage1.length).toBe(1);
      expect(usersPage1[0]!.id).toBe(u2.id);

      const usersPage2 = UserService.getAll({ cursor: u2.id, limit: 1 });
      expect(usersPage2.length).toBe(1);
      expect(usersPage2[0]!.id).toBe(u1.id);
    });
  });

  describe("HTTP Cursor Pagination on /admin/attendances", () => {
    it("should render cursor pagination controls when records exceed limit", async () => {
      const event = EventService.create({
        title: "Evento Para HTTP Pagination",
        location_name: "Sala VIP",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 150,
      });

      AttendanceService.register({
        eventPublicCode: event.public_code,
        dni: "20000001",
        latitude: -12.0463,
        longitude: -77.0427,
        accuracy: 3,
      });
      AttendanceService.register({
        eventPublicCode: event.public_code,
        dni: "20000002",
        latitude: -12.0463,
        longitude: -77.0427,
        accuracy: 3,
      });

      // Request with limit=1 to trigger pagination
      const res = await app.request("/admin/attendances?limit=1", {
        headers: { Cookie: adminCookie },
      });
      expect(res.status).toBe(200);
      const html = await res.text();

      expect(html).toContain("Siguiente Página");
      expect(html).toContain("/admin/attendances?cursor=");
      expect(html).toContain("20000002");
    });
  });

  describe("Mobile Compressed Cards UI", () => {
    it("DashboardView should render 2-col mobile stats and mobile table cards", async () => {
      EventService.create({
        title: "Evento Test Table",
        location_name: "Sede Centro",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 100,
      });

      const res = await app.request("/admin?view=table", {
        headers: { Cookie: adminCookie },
      });
      expect(res.status).toBe(200);
      const html = await res.text();

      // Stat cards: 2 columns on mobile, 3 on desktop
      expect(html).toContain("grid-cols-2 md:grid-cols-3");
      expect(html).toContain("col-span-2 md:col-span-1");

      // Mobile cards vs desktop table
      expect(html).toContain("block md:hidden");
      expect(html).toContain("hidden md:block");
      expect(html).toContain("Evento Test Table");
    });

    it("UsersView should render cleaned form labels, h-10 alignment, and mobile cards", async () => {
      const res = await app.request("/admin/users", {
        headers: { Cookie: adminCookie },
      });
      expect(res.status).toBe(200);
      const html = await res.text();

      // Cleaned form labels (without redundant parentheses)
      expect(html).toContain("DNI <span class=\"text-blue-400\">*</span>");
      expect(html).toContain("Nombre completo <span class=\"text-blue-400\">*</span>");
      expect(html).toContain("Contraseña <span class=\"text-blue-400\">*</span>");
      expect(html).toContain("+ Crear");

      // Modal fullscreen and responsive classes
      expect(html).toContain("userCreateModal");
      expect(html).toContain("userEditModal");

      // Mobile cards vs desktop table
      expect(html).toContain("block md:hidden");
      expect(html).toContain("hidden md:block");
    });

    it("AttendancesView should render mobile compressed cards and desktop table", async () => {
      const event = EventService.create({
        title: "Evento Attendances View",
        location_name: "Sede Norte",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 100,
      });

      AttendanceService.register({
        eventPublicCode: event.public_code,
        dni: "12345678",
        latitude: -12.0463,
        longitude: -77.0427,
        accuracy: 3,
      });

      const res = await app.request("/admin/attendances", {
        headers: { Cookie: adminCookie },
      });
      expect(res.status).toBe(200);
      const html = await res.text();

      expect(html).toContain("block md:hidden");
      expect(html).toContain("hidden md:block");
      expect(html).toContain("attendance-row");
      expect(html).toContain("12345678");
    });

    it("EventDetailView should render attendee mobile cards and desktop table", async () => {
      const event = EventService.create({
        title: "Evento Detalle Mobile Test",
        location_name: "Sala Principal",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 100,
      });

      AttendanceService.register({
        eventPublicCode: event.public_code,
        dni: "33334444",
        latitude: -12.0463,
        longitude: -77.0427,
        accuracy: 4,
      });

      const res = await app.request(`/admin/events/${event.id}`, {
        headers: { Cookie: adminCookie },
      });
      expect(res.status).toBe(200);
      const html = await res.text();

      expect(html).toContain("block md:hidden");
      expect(html).toContain("hidden md:block");
      expect(html).toContain("33334444");
    });
  });
});
