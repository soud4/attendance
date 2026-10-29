import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { initSchema, setDatabase, getDatabase } from "../src/db";
import { EventService, isEventExpired, checkAutoClose } from "../src/services/event.service";
import { AttendanceService } from "../src/services/attendance.service";
import { asistenciaRoute } from "../src/routes/asistencia";
import { geoRoute } from "../src/routes/api/geo";
import { formatSpanishDate, cleanTimeDisplay } from "../src/views/asistencia";

describe("Auto-Close & OSM Reverse Geocoding Feature Tests", () => {
  let db: Database;
  let app: Hono;

  beforeEach(() => {
    db = new Database(":memory:");
    db.run("PRAGMA foreign_keys = ON;");
    setDatabase(db);
    initSchema(db);

    app = new Hono();
    app.route("/", asistenciaRoute);
    app.route("/api/geo", geoRoute);
  });

  afterEach(() => {
    db.close();
    setDatabase(null);
  });

  describe("1. Automatic Event Closing by Schedule", () => {
    it("should correctly identify expired events with ISO datetime in the past", () => {
      const pastDate = new Date(Date.now() - 3600 * 1000).toISOString(); // 1 hour ago
      const event: any = {
        id: 1,
        title: "Evento Pasado",
        status: "OPEN",
        ends_at: pastDate,
      };

      expect(isEventExpired(event)).toBe(true);
    });

    it("should correctly identify non-expired events with future ends_at", () => {
      const futureDate = new Date(Date.now() + 86400 * 1000).toISOString(); // Tomorrow
      const event: any = {
        id: 1,
        title: "Evento Futuro",
        status: "OPEN",
        ends_at: futureDate,
      };

      expect(isEventExpired(event)).toBe(false);
    });

    it("should return false for events without ends_at", () => {
      const event: any = {
        id: 1,
        title: "Evento Sin Cierre",
        status: "OPEN",
        ends_at: null,
      };

      expect(isEventExpired(event)).toBe(false);
    });

    it("checkAutoClose should transition OPEN event in DB to CLOSED when ends_at has passed", () => {
      const pastDate = new Date(Date.now() - 10000).toISOString();
      db.run(`
        INSERT INTO events (public_code, title, location_name, latitude, longitude, radius_meters, starts_at, ends_at, status)
        VALUES ('ev-expired-1', 'Evento Vencido', 'Sede Central', -12.046374, -77.042793, 100, '2026-10-01T08:00', '${pastDate}', 'OPEN');
      `);

      const initial = db.prepare("SELECT * FROM events WHERE public_code = 'ev-expired-1'").get() as any;
      expect(initial.status).toBe("OPEN");

      // Execute checkAutoClose
      const updated = checkAutoClose(initial);
      expect(updated.status).toBe("CLOSED");
      expect(updated.closed_at).toBeDefined();

      // Verify in SQLite database
      const inDb = db.prepare("SELECT * FROM events WHERE public_code = 'ev-expired-1'").get() as any;
      expect(inDb.status).toBe("CLOSED");
      expect(inDb.closed_at).not.toBeNull();
    });

    it("EventService.getByPublicCode should automatically close expired events (lazy auto-close)", () => {
      const pastDate = new Date(Date.now() - 10000).toISOString();
      db.run(`
        INSERT INTO events (public_code, title, location_name, latitude, longitude, radius_meters, ends_at, status)
        VALUES ('ev-lazy-code', 'Lazy Expiry Code', 'Sede Sur', -12.046374, -77.042793, 100, '${pastDate}', 'OPEN');
      `);

      const event = EventService.getByPublicCode("ev-lazy-code");
      expect(event).not.toBeNull();
      expect(event!.status).toBe("CLOSED");

      // Verify status in DB was updated
      const raw = db.prepare("SELECT status FROM events WHERE public_code = 'ev-lazy-code'").get() as any;
      expect(raw.status).toBe("CLOSED");
    });

    it("EventService.getById should automatically close expired events", () => {
      const pastDate = new Date(Date.now() - 10000).toISOString();
      const info = db.prepare(`
        INSERT INTO events (public_code, title, location_name, latitude, longitude, radius_meters, ends_at, status)
        VALUES ('ev-lazy-id', 'Lazy Expiry ID', 'Sede Norte', -12.046374, -77.042793, 100, '${pastDate}', 'OPEN')
        RETURNING id;
      `).get() as { id: number };

      const event = EventService.getById(info.id);
      expect(event).not.toBeNull();
      expect(event!.status).toBe("CLOSED");
    });

    it("EventService.getAllWithStats should automatically close expired events in the list", () => {
      const pastDate = new Date(Date.now() - 10000).toISOString();
      const futureDate = new Date(Date.now() + 86400 * 1000).toISOString();

      db.run(`
        INSERT INTO events (public_code, title, location_name, latitude, longitude, radius_meters, ends_at, status)
        VALUES ('ev-all-expired', 'Expired in List', 'Sede A', -12.046374, -77.042793, 100, '${pastDate}', 'OPEN');
      `);

      db.run(`
        INSERT INTO events (public_code, title, location_name, latitude, longitude, radius_meters, ends_at, status)
        VALUES ('ev-all-active', 'Active in List', 'Sede B', -12.046374, -77.042793, 100, '${futureDate}', 'OPEN');
      `);

      const list = EventService.getAllWithStats();
      const expiredInList = list.find((e) => e.public_code === "ev-all-expired");
      const activeInList = list.find((e) => e.public_code === "ev-all-active");

      expect(expiredInList?.status).toBe("CLOSED");
      expect(activeInList?.status).toBe("OPEN");
    });
  });

  describe("2. Attendance Rejection on Expired Events", () => {
    it("should reject attendance registration with 400 when event has expired by schedule", async () => {
      const pastDate = new Date(Date.now() - 5000).toISOString();
      db.run(`
        INSERT INTO events (public_code, title, location_name, latitude, longitude, radius_meters, ends_at, status)
        VALUES ('ev-expired-attend', 'Evento Ya Finalizado', 'Sede Este', -12.046374, -77.042793, 200, '${pastDate}', 'OPEN');
      `);

      const res = await app.request("/asistir/ev-expired-attend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: "88776655",
          latitude: -12.046374,
          longitude: -77.042793,
          accuracy: 5,
        }),
      });

      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.success).toBe(false);
      expect(data.title).toBe("El registro ha finalizado");
      expect(data.error).toContain("automáticamente");
    });

    it("should allow attendance registration when event ends_at is in the future", async () => {
      const futureDate = new Date(Date.now() + 3600 * 1000).toISOString();
      db.run(`
        INSERT INTO events (public_code, title, location_name, latitude, longitude, radius_meters, ends_at, status)
        VALUES ('ev-valid-future', 'Evento Vigente', 'Sede Oeste', -12.046374, -77.042793, 200, '${futureDate}', 'OPEN');
      `);

      const res = await app.request("/asistir/ev-valid-future", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: "11223344",
          latitude: -12.046374,
          longitude: -77.042793,
          accuracy: 5,
        }),
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.success).toBe(true);
      expect(data.details.dni).toBe("11223344");
    });

    it("GET /asistir/:code/status should report status CLOSED and is_expired true for expired events", async () => {
      const pastDate = new Date(Date.now() - 5000).toISOString();
      db.run(`
        INSERT INTO events (public_code, title, location_name, latitude, longitude, radius_meters, ends_at, status)
        VALUES ('ev-status-check', 'Status Test Event', 'Sede Status', -12.046374, -77.042793, 100, '${pastDate}', 'OPEN');
      `);

      const res = await app.request("/asistir/ev-status-check/status");
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;

      expect(data.success).toBe(true);
      expect(data.status).toBe("CLOSED");
      expect(data.is_open).toBe(false);
      expect(data.is_expired).toBe(true);
    });
  });

  describe("3. OpenStreetMap Reverse Geocoding Proxy (/api/geo/reverse)", () => {
    it("should return 400 when lat or lon parameters are missing", async () => {
      const res1 = await app.request("/api/geo/reverse");
      expect(res1.status).toBe(400);
      const d1 = (await res1.json()) as any;
      expect(d1.success).toBe(false);

      const res2 = await app.request("/api/geo/reverse?lat=-12.046374");
      expect(res2.status).toBe(400);

      const res3 = await app.request("/api/geo/reverse?lon=-77.042793");
      expect(res3.status).toBe(400);
    });

    it("should return 400 when coordinates are out of valid range", async () => {
      const res1 = await app.request("/api/geo/reverse?lat=120&lon=-77.042793");
      expect(res1.status).toBe(400);

      const res2 = await app.request("/api/geo/reverse?lat=-12.046374&lon=-200");
      expect(res2.status).toBe(400);

      const res3 = await app.request("/api/geo/reverse?lat=abc&lon=def");
      expect(res3.status).toBe(400);
    });

    it("should successfully proxy and return formatted place name for valid coordinates", async () => {
      // Test reverse geocoding on Plaza Mayor de Lima (-12.046374, -77.042793)
      const res = await app.request("/api/geo/reverse?lat=-12.046374&lon=-77.042793");

      expect(res.status).toBe(200);
      const data = (await res.json()) as any;

      expect(data.success).toBe(true);
      expect(data.name).toBeDefined();
      expect(typeof data.name).toBe("string");
      expect(data.name.length).toBeGreaterThan(0);
      expect(data.lat).toBeCloseTo(-12.046374, 4);
      expect(data.lon).toBeCloseTo(-77.042793, 4);
      expect(data.display_name).toBeDefined();
    });
  });

  describe("4. Spanish Date, Time & UI Badges Rendering in Attendance View", () => {
    it("formatSpanishDate should correctly format ISO dates to Spanish format", () => {
      const dateStr = formatSpanishDate("2026-10-29T08:30:00", "2026-10-29T00:00:00Z");
      expect(dateStr).toContain("29 de Octubre de 2026");
      expect(dateStr).toContain("Jueves");
    });

    it("cleanTimeDisplay should format ISO datetime strings to friendly 12-hour AM/PM format", () => {
      expect(cleanTimeDisplay("2026-10-29T08:30", "08:00 AM")).toBe("08:30 AM");
      expect(cleanTimeDisplay("2026-10-29T18:00", "06:00 PM")).toBe("06:00 PM");
      expect(cleanTimeDisplay("09:15 AM", "08:00 AM")).toBe("09:15 AM");
    });

    it("GET /asistir/:code should render Spanish date, opening, and closing times", async () => {
      const futureEnd = new Date(Date.now() + 7200 * 1000).toISOString();
      db.run(`
        INSERT INTO events (public_code, title, location_name, latitude, longitude, radius_meters, starts_at, ends_at, status)
        VALUES ('ev-ui-check', 'Cumbre de Innovación 2026', 'Palacio de Gobierno', -12.046374, -77.042793, 100, '2026-10-29T08:30', '${futureEnd}', 'OPEN');
      `);

      const res = await app.request("/asistir/ev-ui-check");
      expect(res.status).toBe(200);

      const html = await res.text();
      expect(html).toContain("Cumbre de Innovación 2026");
      expect(html).toContain("29 de Octubre de 2026");
      expect(html).toContain("Apertura:");
      expect(html).toContain("Cierre:");
      expect(html).toContain("Abierto para registro");
    });

    it("GET /asistir/:code should render auto-close badge when event is expired", async () => {
      const pastEnd = new Date(Date.now() - 3600 * 1000).toISOString();
      db.run(`
        INSERT INTO events (public_code, title, location_name, latitude, longitude, radius_meters, starts_at, ends_at, status)
        VALUES ('ev-ui-expired', 'Cumbre Pasada 2026', 'Palacio de Gobierno', -12.046374, -77.042793, 100, '2026-10-29T08:30', '${pastEnd}', 'OPEN');
      `);

      const res = await app.request("/asistir/ev-ui-expired");
      expect(res.status).toBe(200);

      const html = await res.text();
      expect(html).toContain("Cumbre Pasada 2026");
      expect(html).toContain("Finalizado automáticamente por horario");
      expect(html).toContain("El registro ha finalizado");
    });
  });
});
