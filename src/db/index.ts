import { Database } from "bun:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

export interface User {
  id: number;
  identifier: string;
  password_hash: string;
  full_name: string;
  role: "ADMIN" | "STAFF";
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
}

export interface Event {
  id: number;
  public_code: string;
  title: string;
  location_name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  starts_at: string | null;
  ends_at: string | null;
  status: "DRAFT" | "OPEN" | "CLOSED";
  created_by_user_id: number | null;
  opened_at: string | null;
  closed_at: string | null;
  created_at: string;
}

export interface Attendance {
  id: number;
  event_id: number;
  dni: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  distance_meters: number;
  method: "SELF" | "ASSISTED";
  recorded_by_user_id: number | null;
  device_cookie_hash: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

let dbInstance: Database | null = null;

export function setDatabase(db: Database | null): void {
  dbInstance = db;
}

export function getDatabase(dbPath: string = process.env.DATABASE_PATH || "data.sqlite"): Database {
  if (dbInstance) return dbInstance;

  const targetDir = dirname(dbPath);
  if (targetDir && targetDir !== ".") {
    mkdirSync(targetDir, { recursive: true });
  }

  const db = new Database(dbPath, { create: true });

  // Apply performance & integrity pragmas
  db.run("PRAGMA foreign_keys = ON;");
  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA synchronous = NORMAL;");
  db.run("PRAGMA busy_timeout = 5000;");

  dbInstance = db;
  return db;
}

export function initSchema(db: Database): void {
  const schemaPath = join(__dirname, "schema.sql");
  const schemaSql = readFileSync(schemaPath, "utf-8");
  db.exec(schemaSql);
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
