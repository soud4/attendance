import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { initSchema, setDatabase } from "../src/db";
import { asistenciaRoute } from "../src/routes/asistencia";

describe("Attendance Route API & Verification Checks", () => {
  let db: Database;
  let app: Hono;

  beforeEach(() => {
    db = new Database(":memory:");
    db.run("PRAGMA foreign_keys = ON;");
    setDatabase(db);
    initSchema(db);

    // Seed events
    // Event 1: Open, centered at Plaza Mayor de Lima (-12.046374, -77.042793), radius 100m
    db.run(`
      INSERT INTO events (public_code, title, latitude, longitude, radius_meters, status)
      VALUES ('ev-open-100m', 'Conferencia Anual 2026', -12.046374, -77.042793, 100, 'OPEN');
    `);

    // Event 2: Closed event
    db.run(`
      INSERT INTO events (public_code, title, latitude, longitude, radius_meters, status)
      VALUES ('ev-closed-event', 'Evento Concluido', -12.046374, -77.042793, 100, 'CLOSED');
    `);

    // Create Hono test app with the route
    app = new Hono();
    app.route("/", asistenciaRoute);
  });

  afterEach(() => {
    db.close();
    setDatabase(null);
  });

  it("GET /asistir/:code should render HTML with event title for open event", async () => {
    const res = await app.request("/asistir/ev-open-100m");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("Conferencia Anual 2026");
    expect(html.toLowerCase()).toContain("registro de asistencia");
    expect(html).toContain("DNI");
    expect(html).toContain("ev-open-100m");
  });

  it("GET /asistir/:code should return 404 for nonexistent event", async () => {
    const res = await app.request("/asistir/ev-invalid-code");
    expect(res.status).toBe(404);
    const html = await res.text();
    expect(html).toContain("Evento no encontrado");
  });

  it("POST /asistir/:code should reject invalid DNI format with 400", async () => {
    // 7 digits
    const res1 = await app.request("/asistir/ev-open-100m", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni: "1234567",
        latitude: -12.046374,
        longitude: -77.042793,
        accuracy: 10,
      }),
    });
    expect(res1.status).toBe(400);
    const data1 = await res1.json();
    expect(data1.title).toBe("DNI no válido");

    // Letters in DNI
    const res2 = await app.request("/asistir/ev-open-100m", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni: "1234567A",
        latitude: -12.046374,
        longitude: -77.042793,
        accuracy: 10,
      }),
    });
    expect(res2.status).toBe(400);
  });

  it("POST /asistir/:code should reject location outside event radius with 400", async () => {
    // Coordinate ~2.5 km away from Plaza Mayor
    const farLatitude = -12.068;
    const farLongitude = -77.042793;

    const res = await app.request("/asistir/ev-open-100m", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni: "87654321",
        latitude: farLatitude,
        longitude: farLongitude,
        accuracy: 5,
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.title).toBe("Fuera de la zona del evento");
    expect(data.error).toContain("Te encuentras a aproximadamente");
  });

  it("POST /asistir/:code should successfully record attendance within radius", async () => {
    // Within 20 meters of event center
    const closeLatitude = -12.0464;
    const closeLongitude = -77.0428;

    const res = await app.request("/asistir/ev-open-100m", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni: "01234567", // With leading zero
        latitude: closeLatitude,
        longitude: closeLongitude,
        accuracy: 8,
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe("Asistencia registrada correctamente");
    expect(data.details.dni).toBe("01234567");
  });

  it("POST /asistir/:code should reject duplicate DNI registration with 409 Conflict", async () => {
    const coords = {
      latitude: -12.046374,
      longitude: -77.042793,
      accuracy: 5,
    };

    // First attempt succeeds
    const res1 = await app.request("/asistir/ev-open-100m", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: "70809010", ...coords }),
    });
    expect(res1.status).toBe(200);

    // Second attempt with same DNI must fail with 409 Conflict
    const res2 = await app.request("/asistir/ev-open-100m", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: "70809010", ...coords }),
    });

    expect(res2.status).toBe(409);
    const data2 = await res2.json();
    expect(data2.title).toBe("Asistencia ya registrada");
    expect(data2.error).toContain("70809010");
  });

  it("POST /asistir/:code should reject attendance when event is closed with 400", async () => {
    const res = await app.request("/asistir/ev-closed-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni: "55667788",
        latitude: -12.046374,
        longitude: -77.042793,
        accuracy: 5,
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.title).toBe("El registro ha finalizado");
  });

  it("GET /asistir/:code/status should return event status JSON", async () => {
    const res = await app.request("/asistir/ev-open-100m/status");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe("OPEN");
    expect(data.is_open).toBe(true);
  });
});
