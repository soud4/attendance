import { describe, expect, it, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { initSchema, setDatabase } from "../src/db";
import { seedAdminUser } from "../src/db/seed";
import { UserService } from "../src/services/user.service";
import { AuthService } from "../src/services/auth.service";
import { EventService } from "../src/services/event.service";
import { AttendanceService } from "../src/services/attendance.service";
import { adminUsersRoute } from "../src/routes/admin/users";
import { adminEventsRoute } from "../src/routes/admin/events";
import { adminAttendancesRoute } from "../src/routes/admin/attendances";
import { authRoute } from "../src/routes/admin/auth";
import { createSessionToken } from "../src/utils/auth";
import { SUPER_ADMIN_IDENTIFIER } from "../src/config";

describe("Mobile Tables, Reactive Filters & Coordinator Full CRUD", () => {
  let db: Database;
  let app: Hono;
  let adminCookie: string;
  let staffCookie: string;
  let adminUser: { id: number; identifier: string };

  beforeEach(async () => {
    db = new Database(":memory:");
    db.run("PRAGMA foreign_keys = ON;");
    setDatabase(db);
    initSchema(db);
    await seedAdminUser(db);

    const admin = UserService.getByIdentifier(SUPER_ADMIN_IDENTIFIER)!;
    adminUser = { id: admin.id, identifier: admin.identifier };
    const adminToken = await createSessionToken({
      id: admin.id,
      identifier: admin.identifier,
      full_name: admin.full_name,
      role: admin.role,
    });
    adminCookie = `auth_session=${adminToken}`;

    // Create staff user & session
    const staff = await UserService.create({
      identifier: "77889900",
      full_name: "Staff Operativo",
      password: "password123",
      role: "STAFF",
    });
    const staffToken = await createSessionToken({
      id: staff.id,
      identifier: staff.identifier,
      full_name: staff.full_name,
      role: staff.role,
    });
    staffCookie = `auth_session=${staffToken}`;

    app = new Hono();
    app.route("/", authRoute);
    app.route("/admin", adminEventsRoute);
    app.route("/admin", adminUsersRoute);
    app.route("/admin", adminAttendancesRoute);
  });

  describe("1. UserService CRUD, Self-Protection & SuperAdmin Safeguards", () => {
    it("UserService.update should successfully update full_name, role, and optionally password", async () => {
      const user = await UserService.create({
        identifier: "12345678",
        full_name: "Original Name",
        password: "oldpassword",
        role: "STAFF",
      });

      // Update name and role without changing password
      const updated1 = await UserService.update(user.id, {
        full_name: "Updated Name",
        role: "ADMIN",
      });
      expect(updated1.full_name).toBe("Updated Name");
      expect(updated1.role).toBe("ADMIN");

      // Verify old password still works
      const authOld = await AuthService.authenticate("12345678", "oldpassword");
      expect(authOld.user.id).toBe(user.id);

      // Update password
      const updated2 = await UserService.update(user.id, {
        password: "newpassword123",
      });
      expect(updated2.full_name).toBe("Updated Name");

      // Verify new password works and old password fails
      const authNew = await AuthService.authenticate("12345678", "newpassword123");
      expect(authNew.user.id).toBe(user.id);
      expect(AuthService.authenticate("12345678", "oldpassword")).rejects.toThrow();
    });

    it("UserService.toggleStatus should prevent user from deactivating themselves", async () => {
      const operator = await UserService.create({
        identifier: "99887766",
        full_name: "Operador Test",
        password: "password123",
        role: "STAFF",
      });

      expect(() => {
        UserService.toggleStatus(operator.id, operator.id);
      }).toThrow("No puedes desactivar tu propia cuenta en sesión");
    });

    it("UserService.toggleStatus should prevent deactivating the SuperAdmin", async () => {
      // Create a secondary admin
      const secondAdmin = await UserService.create({
        identifier: "11223344",
        full_name: "Segundo Admin",
        password: "password123",
        role: "ADMIN",
      });

      expect(() => {
        UserService.toggleStatus(adminUser.id, secondAdmin.id);
      }).toThrow("No se puede desactivar la cuenta del Administrador Principal");
    });

    it("UserService.delete should prevent user from deleting themselves", async () => {
      const operator = await UserService.create({
        identifier: "99887765",
        full_name: "Operador Test 2",
        password: "password123",
        role: "STAFF",
      });

      expect(() => {
        UserService.delete(operator.id, operator.id);
      }).toThrow("No puedes eliminar tu propia cuenta en sesión");
    });

    it("UserService.delete should prevent deleting the SuperAdmin", async () => {
      const secondAdmin = await UserService.create({
        identifier: "11223344",
        full_name: "Segundo Admin",
        password: "password123",
        role: "ADMIN",
      });

      expect(() => {
        UserService.delete(adminUser.id, secondAdmin.id);
      }).toThrow("No se puede eliminar la cuenta del Administrador Principal");
    });

    it("POST /admin/users/:id/edit should update user through HTTP endpoint", async () => {
      const staff = await UserService.create({
        identifier: "55443322",
        full_name: "Operador Temp",
        password: "secretpassword",
        role: "STAFF",
      });

      const formData = new FormData();
      formData.append("full_name", "Operador Ascendido");
      formData.append("role", "ADMIN");
      formData.append("password", "newsecret999");

      const res = await app.request(`/admin/users/${staff.id}/edit`, {
        method: "POST",
        headers: { Cookie: adminCookie },
        body: formData,
      });

      expect(res.status).toBe(302);
      expect(res.headers.get("Location")).toContain("/admin/users");

      const reloaded = UserService.getById(staff.id);
      expect(reloaded?.full_name).toBe("Operador Ascendido");
      expect(reloaded?.role).toBe("ADMIN");

      const verifyAuth = await AuthService.authenticate("55443322", "newsecret999");
      expect(verifyAuth.user.id).toBe(staff.id);
    });

    it("POST /admin/users/:id/edit should reject non-ADMIN callers with 403", async () => {
      const staff = await UserService.create({
        identifier: "55443323",
        full_name: "Operador Dos",
        password: "secretpassword",
        role: "STAFF",
      });

      const formData = new FormData();
      formData.append("full_name", "Operador Intento");

      const res = await app.request(`/admin/users/${staff.id}/edit`, {
        method: "POST",
        headers: { Cookie: staffCookie },
        body: formData,
      });

      expect(res.status).toBe(403);
    });
  });

  describe("2. Coordinators View UI: Modals, Search & Filter Controls", () => {
    it("GET /admin/users should render full search toolbar, role tabs, date filter and order toggle", async () => {
      const res = await app.request("/admin/users", {
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(200);
      const html = await res.text();

      // Search and filters
      expect(html).toContain('id="userSearchInput"');
      expect(html).toContain('id="userRoleTabs"');
      expect(html).toContain('id="userDateFilter"');
      expect(html).toContain('id="userOrderToggleBtn"');
      expect(html).toContain('id="userEmptyFilterMessage"');
      expect(html).toContain('id="userVisibleCount"');

      // Fullscreen mobile modals
      expect(html).toContain('id="userCreateModal"');
      expect(html).toContain('id="userEditModal"');
      expect(html).toContain('id="userDeleteModal"');

      // Containers
      expect(html).toContain('id="userMobileContainer"');
      expect(html).toContain('id="userTableBody"');
    });
  });

  describe("3. Events Dashboard UI: Tabs, Search & Order Controls", () => {
    it("GET /admin should render search input, status tabs, date filter, and order toggle", async () => {
      EventService.create({
        title: "Evento Filtrado Test",
        location_name: "Auditorio Magna",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 100,
      });

      const res = await app.request("/admin", {
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(200);
      const html = await res.text();

      // Status Tabs & Search Toolbar
      expect(html).toContain('id="eventSearchInput"');
      expect(html).toContain('id="eventStatusTabs"');
      expect(html).toContain('id="eventDateFilter"');
      expect(html).toContain('id="eventOrderToggleBtn"');
      expect(html).toContain('id="eventEmptyFilterMessage"');
      expect(html).toContain('id="eventVisibleCount"');

      // Cards container and data attributes
      expect(html).toContain('id="eventCardsContainer"');
      expect(html).toContain('data-title="evento filtrado test"');
      expect(html).toContain('data-location="auditorio magna"');
      expect(html).toContain('data-status="OPEN"');
    });

    it("GET /admin?view=table should render mobile container and desktop table with filter attributes", async () => {
      EventService.create({
        title: "Evento Vista Tabla",
        location_name: "Pabellón B",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 100,
      });

      const res = await app.request("/admin?view=table", {
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(200);
      const html = await res.text();

      expect(html).toContain('id="eventTableMobileContainer"');
      expect(html).toContain('id="eventTableBody"');
      expect(html).toContain('data-title="evento vista tabla"');
      expect(html).toContain('data-location="pabellón b"');
    });
  });

  describe("4. Attendances Management UI: Compact Mobile Cards & Dual Filter", () => {
    it("GET /admin/attendances should render search bar, date filter, order switch, and compact cards", async () => {
      const event = EventService.create({
        title: "Evento de Asistencia",
        location_name: "Explanada Central",
        latitude: -12.0463,
        longitude: -77.0427,
        radius_meters: 200,
      });

      AttendanceService.register({
        eventPublicCode: event.public_code,
        dni: "88887777",
        latitude: -12.0463,
        longitude: -77.0427,
        accuracy: 4,
        fullName: "Carlos Pruebas",
        baseName: "Base Callao",
      });

      const res = await app.request("/admin/attendances", {
        headers: { Cookie: adminCookie },
      });

      expect(res.status).toBe(200);
      const html = await res.text();

      // Search & Filters toolbar
      expect(html).toContain('id="attendanceFilterInput"');
      expect(html).toContain('id="attendanceDateFilter"');
      expect(html).toContain('id="attendanceOrderToggleBtn"');
      expect(html).toContain('id="attendanceVisibleCount"');
      expect(html).toContain('id="attendanceEmptyFilterMessage"');

      // Containers
      expect(html).toContain('id="attendanceMobileContainer"');
      expect(html).toContain('id="attendancesTableBody"');

      // Compact card elements
      expect(html).toContain("88887777");
      expect(html).toContain("Carlos Pruebas");
      expect(html).toContain("Base Callao");
      expect(html).toContain("Autoservicio");
      expect(html).toContain('data-dni="88887777"');
      expect(html).toContain('data-name="carlos pruebas"');
      expect(html).toContain('data-event="evento de asistencia"');
    });
  });
});
