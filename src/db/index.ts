import { Database } from "bun:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { env } from "../config/env";

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
  check_out_at: string | null;
}

/**
 * DatabaseConnection Singleton Manager
 * Encapsulates the embedded SQLite lifecycle, PRAGMA configuration,
 * and Prepared Statement caching for sub-microsecond query execution.
 */
export class DatabaseConnection {
  private static instance: Database | null = null;
  private static statementCache = new Map<string, any>();

  /**
   * Apply database configuration PRAGMAs cleanly in WAL mode
   */
  private static applyPragmas(db: Database): void {
    db.run("PRAGMA foreign_keys = ON;");
    db.run("PRAGMA journal_mode = WAL;");
    db.run("PRAGMA synchronous = NORMAL;");
    db.run("PRAGMA busy_timeout = 5000;");
  }

  /**
   * Get the singleton Database instance
   */
  public static getInstance(dbPath: string = env.DATABASE_PATH): Database {
    if (this.instance) {
      return this.instance;
    }

    const targetDir = dirname(dbPath);
    if (targetDir && targetDir !== ".") {
      mkdirSync(targetDir, { recursive: true });
    }

    const db = new Database(dbPath, { create: true });
    this.applyPragmas(db);
    this.instance = db;
    return db;
  }

  /**
   * Prepared Statement caching: avoids recompiling SQL bytecode on every invocation
   */
  public static prepare(sql: string): any {
    const db = this.getInstance();
    let stmt = this.statementCache.get(sql);
    if (!stmt) {
      stmt = db.prepare(sql);
      this.statementCache.set(sql, stmt);
    }
    return stmt;
  }

  /**
   * Explicitly set or swap instance (primarily used in automated unit tests)
   */
  public static setInstance(db: Database | null): void {
    this.instance = db;
    this.statementCache.clear();
  }

  /**
   * Close connection and release cached statements
   */
  public static close(): void {
    if (this.instance) {
      this.instance.close();
      this.instance = null;
      this.statementCache.clear();
    }
  }
}

// Backward-compatible exports
export function getDatabase(dbPath?: string): Database {
  return DatabaseConnection.getInstance(dbPath);
}

export function setDatabase(db: Database | null): void {
  DatabaseConnection.setInstance(db);
}

export function closeDatabase(): void {
  DatabaseConnection.close();
}

export function initSchema(db: Database): void {
  const schemaPath = join(__dirname, "schema.sql");
  const schemaSql = readFileSync(schemaPath, "utf-8");
  db.exec(schemaSql);

  // Safe migration: ensure check_out_at column exists in existing database files
  try {
    const cols = db.prepare("PRAGMA table_info(attendances);").all() as { name: string }[];
    const hasCheckOut = cols.some((c) => c.name === "check_out_at");
    if (!hasCheckOut) {
      db.exec("ALTER TABLE attendances ADD COLUMN check_out_at TEXT;");
    }
  } catch {
    // Ignore if table does not exist yet
  }
}
