import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { initSchema, setDatabase } from "../src/db";
import { EventService } from "../src/services/event.service";
import { createApp } from "../src/index";

describe("Public Home View - Recent Events (Max 4, Clickable Only When Active)", () => {
  let db: Database;
  let app: Hono;

  beforeEach(() => {
    db = new Database(":memory:");
    db.run("PRAGMA foreign_keys = ON;");
    setDatabase(db);
    initSchema(db);

    app = createApp();
  });

  afterEach(() => {
    db.close();
    setDatabase(null);
  });

  it("should return empty state when no events exist", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("Control de Asistencia");
    expect(html).toContain("Sin eventos disponibles");
  });

  it("should show maximum 4 events ordered by created_at DESC (newest first)", () => {
    // Insert 6 events with staggered creation times
    const pastTime = new Date(Date.now() - 600000).toISOString();
    const midTime = new Date(Date.now() - 300000).toISOString();
    const recentTime = new Date(Date.now() - 100000).toISOString();
    const newestTime = new Date(Date.now() - 10000).toISOString();

    db.run(`INSERT INTO events (public_code, title, latitude, longitude, status, created_at) VALUES ('ev-1', 'Evento Uno', 0, 0, 'OPEN', '${pastTime}')`);
    db.run(`INSERT INTO events (public_code, title, latitude, longitude, status, created_at) VALUES ('ev-2', 'Evento Dos', 0, 0, 'OPEN', '${pastTime}')`);
    db.run(`INSERT INTO events (public_code, title, latitude, longitude, status, created_at) VALUES ('ev-3', 'Evento Tres', 0, 0, 'OPEN', '${midTime}')`);
    db.run(`INSERT INTO events (public_code, title, latitude, longitude, status, created_at) VALUES ('ev-4', 'Evento Cuatro', 0, 0, 'OPEN', '${recentTime}')`);
    db.run(`INSERT INTO events (public_code, title, latitude, longitude, status, created_at) VALUES ('ev-5', 'Evento Cinco', 0, 0, 'OPEN', '${newestTime}')`);
    db.run(`INSERT INTO events (public_code, title, latitude, longitude, status, created_at) VALUES ('ev-6', 'Evento Seis', 0, 0, 'OPEN', '${new Date().toISOString()}')`);

    const latest = EventService.getLatestPublicEvents(4);
    expect(latest.length).toBe(4);

    // Most recent first: Evento Seis, then Cinco, then Cuatro, then Tres
    expect(latest[0]!.public_code).toBe("ev-6");
    expect(latest[1]!.public_code).toBe("ev-5");
    expect(latest[2]!.public_code).toBe("ev-4");
    expect(latest[3]!.public_code).toBe("ev-3");
  });

  it("should correctly mark is_active: true for active events and false for closed/expired ones", () => {
    // 1. Open event with future ends_at
    const futureDate = new Date(Date.now() + 3600000).toISOString();
    db.run(`
      INSERT INTO events (public_code, title, latitude, longitude, status, ends_at)
      VALUES ('ev-active', 'Evento Activo', -12.0463, -77.0427, 'OPEN', '${futureDate}')
    `);

    // 2. Closed event
    db.run(`
      INSERT INTO events (public_code, title, latitude, longitude, status)
      VALUES ('ev-closed', 'Evento Cerrado Manualmente', -12.0463, -77.0427, 'CLOSED')
    `);

    // 3. Open event with schedule in the past (expired)
    const pastDate = new Date(Date.now() - 3600000).toISOString();
    db.run(`
      INSERT INTO events (public_code, title, latitude, longitude, status, ends_at)
      VALUES ('ev-expired', 'Evento Vencido', -12.0463, -77.0427, 'OPEN', '${pastDate}')
    `);

    const events = EventService.getLatestPublicEvents(4);
    expect(events.length).toBe(3);

    const activeEvt = events.find((e) => e.public_code === "ev-active");
    expect(activeEvt).toBeDefined();
    expect(activeEvt?.is_active).toBe(true);

    const closedEvt = events.find((e) => e.public_code === "ev-closed");
    expect(closedEvt).toBeDefined();
    expect(closedEvt?.is_active).toBe(false);

    const expiredEvt = events.find((e) => e.public_code === "ev-expired");
    expect(expiredEvt).toBeDefined();
    expect(expiredEvt?.is_active).toBe(false);
    expect(expiredEvt?.status).toBe("CLOSED"); // Auto-closed lazily
  });

  it("GET / should render clickable links ONLY for active events and disabled cards for inactive ones", async () => {
    const futureDate = new Date(Date.now() + 3600000).toISOString();
    db.run(`
      INSERT INTO events (public_code, title, latitude, longitude, status, ends_at, location_name)
      VALUES ('ev-active-now', 'Asamblea En Curso 2026', -12.0463, -77.0427, 'OPEN', '${futureDate}', 'Auditorio Central')
    `);

    db.run(`
      INSERT INTO events (public_code, title, latitude, longitude, status, location_name)
      VALUES ('ev-closed-prev', 'Reunión Pasada', -12.0463, -77.0427, 'CLOSED', 'Sala B')
    `);

    const res = await app.request("/");
    expect(res.status).toBe(200);

    const html = await res.text();

    // Active event must have a clickable link to /asistir/:code
    expect(html).toContain('href="/asistir/ev-active-now"');
    expect(html).toContain("Asamblea En Curso 2026");
    expect(html).toContain("En curso");
    expect(html).toContain("Registrar Asistencia");
    expect(html).toContain("border-emerald-500");

    // Inactive event must NOT have a link to /asistir/ev-closed-prev
    expect(html).not.toContain('href="/asistir/ev-closed-prev"');
    expect(html).toContain("Reunión Pasada");
    expect(html).toContain("Finalizado");
    expect(html).toContain("Registro no disponible");
    expect(html).toContain("cursor-not-allowed");
  });
});
