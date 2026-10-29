import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { initSchema } from "../src/db";

describe("Database Schema & Constraints", () => {
  let db: Database;

  beforeEach(() => {
    // In-memory SQLite database for isolated test execution
    db = new Database(":memory:");
    db.run("PRAGMA foreign_keys = ON;");
    initSchema(db);
  });

  afterEach(() => {
    db.close();
  });

  it("should create user and event successfully", () => {
    // 1. Insert an admin user
    const insertUser = db.prepare(`
      INSERT INTO users (identifier, password_hash, full_name, role)
      VALUES ($identifier, $password_hash, $full_name, $role)
      RETURNING id;
    `);

    const user = insertUser.get({
      $identifier: "admin@eventos.org",
      $password_hash: "$argon2id$mockhash",
      $full_name: "Admin Principal",
      $role: "ADMIN",
    }) as { id: number };

    expect(user.id).toBeGreaterThan(0);

    // 2. Insert an event
    const insertEvent = db.prepare(`
      INSERT INTO events (public_code, title, latitude, longitude, radius_meters, status, created_by_user_id)
      VALUES ($public_code, $title, $latitude, $longitude, $radius_meters, $status, $created_by_user_id)
      RETURNING id, status;
    `);

    const event = insertEvent.get({
      $public_code: "ev-test1",
      $title: "Evento Inaugural",
      $latitude: -12.046374,
      $longitude: -77.042793,
      $radius_meters: 100,
      $status: "OPEN",
      $created_by_user_id: user.id,
    }) as { id: number; status: string };

    expect(event.id).toBeGreaterThan(0);
    expect(event.status).toBe("OPEN");
  });

  it("should enforce strict 8-digit numeric DNI", () => {
    // Setup open event
    db.run(`
      INSERT INTO events (public_code, title, latitude, longitude, radius_meters, status)
      VALUES ('ev-dni-test', 'Test Event', -12.04, -77.04, 100, 'OPEN');
    `);
    const event = db.query(`SELECT id FROM events WHERE public_code = 'ev-dni-test'`).get() as { id: number };

    const insertAttendance = db.prepare(`
      INSERT INTO attendances (event_id, dni, latitude, longitude, accuracy_meters, distance_meters, method)
      VALUES ($event_id, $dni, -12.04, -77.04, 5.0, 10.0, 'SELF');
    `);

    // Valid 8 digits with leading zero
    expect(() => {
      insertAttendance.run({ $event_id: event.id, $dni: "01234567" });
    }).not.toThrow();

    // Invalid: 7 digits
    expect(() => {
      insertAttendance.run({ $event_id: event.id, $dni: "1234567" });
    }).toThrow();

    // Invalid: 9 digits
    expect(() => {
      insertAttendance.run({ $event_id: event.id, $dni: "123456789" });
    }).toThrow();

    // Invalid: Contains letters
    expect(() => {
      insertAttendance.run({ $event_id: event.id, $dni: "1234567A" });
    }).toThrow();

    // Invalid: Contains spaces
    expect(() => {
      insertAttendance.run({ $event_id: event.id, $dni: "1234 567" });
    }).toThrow();
  });

  it("should prevent duplicate attendance for the same DNI in the same event", () => {
    db.run(`
      INSERT INTO events (public_code, title, latitude, longitude, radius_meters, status)
      VALUES ('ev-unique-test', 'Duplicate Check Event', -12.04, -77.04, 100, 'OPEN');
    `);
    const event = db.query(`SELECT id FROM events WHERE public_code = 'ev-unique-test'`).get() as { id: number };

    const insertAttendance = db.prepare(`
      INSERT INTO attendances (event_id, dni, latitude, longitude, accuracy_meters, distance_meters, method)
      VALUES ($event_id, $dni, -12.04, -77.04, 8.0, 15.0, 'SELF');
    `);

    // First registration succeeds
    insertAttendance.run({ $event_id: event.id, $dni: "76543210" });

    // Second registration with same DNI in same event must fail
    expect(() => {
      insertAttendance.run({ $event_id: event.id, $dni: "76543210" });
    }).toThrow();
  });

  it("should allow the same DNI to attend different events", () => {
    db.run(`
      INSERT INTO events (public_code, title, latitude, longitude, radius_meters, status)
      VALUES 
        ('ev-event-1', 'Event 1', -12.04, -77.04, 100, 'OPEN'),
        ('ev-event-2', 'Event 2', -12.04, -77.04, 100, 'OPEN');
    `);
    const ev1 = db.query(`SELECT id FROM events WHERE public_code = 'ev-event-1'`).get() as { id: number };
    const ev2 = db.query(`SELECT id FROM events WHERE public_code = 'ev-event-2'`).get() as { id: number };

    const insert = db.prepare(`
      INSERT INTO attendances (event_id, dni, latitude, longitude, accuracy_meters, distance_meters, method)
      VALUES ($event_id, $dni, -12.04, -77.04, 5.0, 10.0, 'SELF');
    `);

    expect(() => {
      insert.run({ $event_id: ev1.id, $dni: "88888888" });
      insert.run({ $event_id: ev2.id, $dni: "88888888" });
    }).not.toThrow();
  });

  it("should trigger rejection when event status is not OPEN", () => {
    db.run(`
      INSERT INTO events (public_code, title, latitude, longitude, radius_meters, status)
      VALUES 
        ('ev-draft', 'Draft Event', -12.04, -77.04, 100, 'DRAFT'),
        ('ev-closed', 'Closed Event', -12.04, -77.04, 100, 'CLOSED');
    `);
    const draftEvent = db.query(`SELECT id FROM events WHERE public_code = 'ev-draft'`).get() as { id: number };
    const closedEvent = db.query(`SELECT id FROM events WHERE public_code = 'ev-closed'`).get() as { id: number };

    const insert = db.prepare(`
      INSERT INTO attendances (event_id, dni, latitude, longitude, accuracy_meters, distance_meters, method)
      VALUES ($event_id, $dni, -12.04, -77.04, 5.0, 10.0, 'SELF');
    `);

    // Cannot record in DRAFT event
    expect(() => {
      insert.run({ $event_id: draftEvent.id, $dni: "11223344" });
    }).toThrow(/Event is not open/);

    // Cannot record in CLOSED event
    expect(() => {
      insert.run({ $event_id: closedEvent.id, $dni: "11223344" });
    }).toThrow(/Event is not open/);
  });

  it("should require recorded_by_user_id when method is ASSISTED", () => {
    db.run(`
      INSERT INTO events (public_code, title, latitude, longitude, radius_meters, status)
      VALUES ('ev-assisted-test', 'Assisted Event', -12.04, -77.04, 100, 'OPEN');
    `);
    const event = db.query(`SELECT id FROM events WHERE public_code = 'ev-assisted-test'`).get() as { id: number };

    // Fails because recorded_by_user_id is missing for ASSISTED
    expect(() => {
      db.run(`
        INSERT INTO attendances (event_id, dni, latitude, longitude, accuracy_meters, distance_meters, method, recorded_by_user_id)
        VALUES (${event.id}, '99887766', -12.04, -77.04, 5.0, 10.0, 'ASSISTED', NULL);
      `);
    }).toThrow();

    // Succeeds when user is provided
    db.run(`
      INSERT INTO users (identifier, password_hash, full_name, role)
      VALUES ('staff1', 'hash', 'Staff Member', 'STAFF');
    `);
    const user = db.query(`SELECT id FROM users WHERE identifier = 'staff1'`).get() as { id: number };

    expect(() => {
      db.run(`
        INSERT INTO attendances (event_id, dni, latitude, longitude, accuracy_meters, distance_meters, method, recorded_by_user_id)
        VALUES (${event.id}, '99887766', -12.04, -77.04, 5.0, 10.0, 'ASSISTED', ${user.id});
      `);
    }).not.toThrow();
  });
});
