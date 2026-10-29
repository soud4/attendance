import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { initSchema, setDatabase } from "../src/db";
import { asistenciaRoute } from "../src/routes/asistencia";
import { AttendanceService } from "../src/services/attendance.service";

describe("Attendance Check-in and Check-out Flow", () => {
  let db: Database;
  let app: Hono;

  beforeEach(() => {
    db = new Database(":memory:");
    db.run("PRAGMA foreign_keys = ON;");
    setDatabase(db);
    initSchema(db);
    AttendanceService.clearCache();

    // Open event centered at (-12.046374, -77.042793), radius 100m
    db.run(`
      INSERT INTO events (public_code, title, latitude, longitude, radius_meters, status)
      VALUES ('ev-checkout-test', 'Evento con Control de Salida', -12.046374, -77.042793, 100, 'OPEN');
    `);

    app = new Hono();
    app.route("/", asistenciaRoute);
  });

  afterEach(() => {
    db.close();
    setDatabase(null);
    AttendanceService.clearCache();
  });

  it("should record check-in on first submission and set cookie", async () => {
    const res = await app.request("/asistir/ev-checkout-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni: "12345678",
        latitude: -12.046374,
        longitude: -77.042793,
        accuracy: 5,
      }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.action).toBe("CHECK_IN");
    expect(data.message).toContain("Entrada registrada");
    expect(data.details.check_in_at).toBeDefined();
    expect(data.details.check_out_at).toBeNull();

    // Verify Set-Cookie header exists
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain("att_ev-checkout-test=12345678");
  });

  it("should record check-out on second submission and update check_out_at", async () => {
    const coords = {
      latitude: -12.046374,
      longitude: -77.042793,
      accuracy: 5,
    };

    // 1. Check-in
    const res1 = await app.request("/asistir/ev-checkout-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: "87654321", ...coords }),
    });
    expect(res1.status).toBe(200);
    const data1 = (await res1.json()) as any;
    expect(data1.action).toBe("CHECK_IN");

    // 2. Check-out
    const res2 = await app.request("/asistir/ev-checkout-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: "87654321", ...coords }),
    });
    expect(res2.status).toBe(200);
    const data2 = (await res2.json()) as any;
    expect(data2.success).toBe(true);
    expect(data2.action).toBe("CHECK_OUT");
    expect(data2.message).toContain("Salida registrada");
    expect(data2.details.check_in_at).toBeDefined();
    expect(data2.details.check_out_at).toBeDefined();

    // Verify database record
    const record = AttendanceService.getByEventAndDni(1, "87654321");
    expect(record).not.toBeNull();
    expect(record?.created_at).toBeDefined();
    expect(record?.check_out_at).toBeDefined();
  });

  it("should reject third submission with 409 Conflict once check-out is complete", async () => {
    const coords = {
      latitude: -12.046374,
      longitude: -77.042793,
      accuracy: 5,
    };

    // 1. Check-in
    await app.request("/asistir/ev-checkout-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: "11223344", ...coords }),
    });

    // 2. Check-out
    await app.request("/asistir/ev-checkout-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: "11223344", ...coords }),
    });

    // 3. Third attempt
    const res3 = await app.request("/asistir/ev-checkout-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: "11223344", ...coords }),
    });

    expect(res3.status).toBe(409);
    const data3 = (await res3.json()) as any;
    expect(data3.title).toBe("Asistencia ya registrada");
  });

  it("should reject check-out if attendee moves outside the event geofence", async () => {
    // 1. Check-in inside venue
    await app.request("/asistir/ev-checkout-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni: "99887766",
        latitude: -12.046374,
        longitude: -77.042793,
        accuracy: 5,
      }),
    });

    // 2. Attempt Check-out 3 km away
    const resFar = await app.request("/asistir/ev-checkout-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni: "99887766",
        latitude: -12.080,
        longitude: -77.042793,
        accuracy: 5,
      }),
    });

    expect(resFar.status).toBe(400);
    const dataFar = (await resFar.json()) as any;
    expect(dataFar.title).toBe("Fuera de la zona del evento");

    // Check-out should still be NULL in database
    const record = AttendanceService.getByEventAndDni(1, "99887766");
    expect(record?.check_out_at).toBeNull();
  });

  it("should pre-render active check-in state when cookie is present on GET /asistir/:code", async () => {
    // 1. Perform check-in
    await app.request("/asistir/ev-checkout-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni: "55443322",
        latitude: -12.046374,
        longitude: -77.042793,
        accuracy: 5,
      }),
    });

    // 2. Load page with cookie
    const res = await app.request("/asistir/ev-checkout-test", {
      headers: {
        Cookie: "att_ev-checkout-test=55443322",
      },
    });

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Entrada registrada");
    expect(html).toContain("Marcar salida");
    expect(html).toContain("55443322");
  });

  it("should render completed attendance view when user already has both check-in and check-out", async () => {
    const coords = {
      latitude: -12.046374,
      longitude: -77.042793,
      accuracy: 5,
    };

    // 1. Check-in
    await app.request("/asistir/ev-checkout-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: "33221100", ...coords }),
    });

    // 2. Check-out
    await app.request("/asistir/ev-checkout-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: "33221100", ...coords }),
    });

    // 3. Load page with cookie
    const res = await app.request("/asistir/ev-checkout-test", {
      headers: {
        Cookie: "att_ev-checkout-test=33221100",
      },
    });

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Asistencia completa confirmada");
    expect(html).toContain("Entrada:");
    expect(html).toContain("Salida:");
  });
});
