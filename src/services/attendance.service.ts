import { getDatabase, type Attendance, type Event, type Attendee } from "../db";
import { EventService, isEventExpired, checkAutoClose } from "./event.service";
import {
  ValidationError,
  InvalidDniError,
  InvalidCoordinatesError,
  EventNotFoundError,
  EventClosedError,
  OutOfRadiusError,
  AttendanceAlreadyRegisteredError,
} from "./errors";
import { EARTH_RADIUS_METERS, DNI_REGEX, GPS_TOLERANCE_BUFFER_METERS } from "../config";

export interface RegisterAttendanceInput {
  eventPublicCode: string;
  dni: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  fullName?: string;
  baseName?: string;
  method?: "SELF" | "ASSISTED";
  recordedByUserId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AttendanceResult {
  attendanceId: number;
  event: Event;
  dni: string;
  distanceMeters: number;
  recordedAt: string;
  action: "CHECK_IN" | "CHECK_OUT";
  checkInAt?: string;
  checkOutAt?: string;
  fullName?: string | null;
  baseName?: string | null;
}

export interface AttendanceWithEvent extends Attendance {
  event_title: string;
  event_public_code: string;
  attendee_name?: string | null;
  attendee_base?: string | null;
}

export interface AttendanceWithAttendee extends Attendance {
  attendee_name?: string | null;
  attendee_base?: string | null;
}

export interface PaginationOptions {
  cursor?: number | null;
  limit?: number | null;
}

export class AttendanceService {
  // In-memory cache of fully completed (event_id:dni) keys to reject repeat attempts in 0 ms
  private static completedAttendanceKeys = new Set<string>();
  private static cachedDbRef: any = null;

  public static clearCache(): void {
    this.completedAttendanceKeys.clear();
    this.cachedDbRef = null;
  }

  private static ensureCacheInitialized(db: any): void {
    if (this.cachedDbRef !== db) {
      this.completedAttendanceKeys.clear();
      this.cachedDbRef = db;
    }
  }

  /**
   * Calculate distance between two coordinates in meters using the Haversine formula
   */
  public static calculateDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = EARTH_RADIUS_METERS;
    const toRad = (angle: number) => (angle * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Register attendance for an attendee with atomic unique constraint enforcement
   */
  public static register(input: RegisterAttendanceInput): AttendanceResult {
    const dni = String(input.dni || "").trim();

    // 1. Strict DNI Validation (8 digits)
    if (!DNI_REGEX.test(dni)) {
      throw new InvalidDniError("El DNI debe contener exactamente 8 dígitos numéricos sin letras ni símbolos.");
    }

    // 2. Validate coordinates
    if (
      typeof input.latitude !== "number" ||
      typeof input.longitude !== "number" ||
      typeof input.accuracy !== "number" ||
      isNaN(input.latitude) ||
      input.latitude < -90 ||
      input.latitude > 90 ||
      isNaN(input.longitude) ||
      input.longitude < -180 ||
      input.longitude > 180 ||
      input.accuracy < 0
    ) {
      throw new InvalidCoordinatesError("Las coordenadas GPS proporcionadas son inválidas o están fuera de rango.");
    }

    const db = getDatabase();

    // 3. Find event (getByPublicCode also executes auto-close check)
    let event = EventService.getByPublicCode(input.eventPublicCode);

    if (!event) {
      throw new EventNotFoundError(input.eventPublicCode);
    }

    // 4. Validate event expiration and OPEN status
    if (isEventExpired(event)) {
      checkAutoClose(event);
      throw new EventClosedError("El evento ha concluido y el registro se ha cerrado automáticamente.");
    }

    if (event.status !== "OPEN") {
      throw new EventClosedError("El registro para este evento ha finalizado o se encuentra cerrado.");
    }

    // 5. Calculate Distance & Validate Coverage Radius
    const distanceMeters = this.calculateDistanceMeters(
      event.latitude,
      event.longitude,
      input.latitude,
      input.longitude
    );

    // Apply a reasonable GPS accuracy buffer (up to GPS_TOLERANCE_BUFFER_METERS)
    // to account for antenna attenuation, indoor degradation, and device margins.
    const accuracyBuffer = Math.min(Math.max(0, input.accuracy || 0), GPS_TOLERANCE_BUFFER_METERS);
    const effectiveAllowedRadius = event.radius_meters + accuracyBuffer;

    if (distanceMeters > effectiveAllowedRadius) {
      throw new OutOfRadiusError(distanceMeters, event.radius_meters, input.accuracy);
    }

    // 6. Fast In-Memory Check for fully completed attendees (0 ms)
    const memoryKey = `${event.id}:${dni}`;
    this.ensureCacheInitialized(db);
    if (this.completedAttendanceKeys.has(memoryKey)) {
      throw new AttendanceAlreadyRegisteredError(dni);
    }

    // Lookup attendee in directory
    const attendeeStmt = db.prepare("SELECT * FROM attendees WHERE dni = $dni LIMIT 1;");
    let existingAttendee = attendeeStmt.get({ $dni: dni }) as Attendee | undefined;

    // 7. Check if attendee already registered Entrada
    const existingStmt = db.prepare(`
      SELECT id, created_at, check_out_at
      FROM attendances
      WHERE event_id = $event_id AND dni = $dni;
    `);
    const existing = existingStmt.get({ $event_id: event.id, $dni: dni }) as
      | { id: number; created_at: string; check_out_at: string | null }
      | undefined;

    if (existing) {
      if (existing.check_out_at) {
        this.completedAttendanceKeys.add(memoryKey);
        throw new AttendanceAlreadyRegisteredError(dni);
      }

      // Record CHECK_OUT (Salida)
      const updateStmt = db.prepare(`
        UPDATE attendances
        SET check_out_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = $id AND check_out_at IS NULL
        RETURNING check_out_at;
      `);
      const updated = updateStmt.get({ $id: existing.id }) as { check_out_at: string } | undefined;
      const checkOutAt = updated?.check_out_at || new Date().toISOString();
      this.completedAttendanceKeys.add(memoryKey);

      return {
        attendanceId: existing.id,
        event,
        dni,
        distanceMeters,
        recordedAt: checkOutAt,
        action: "CHECK_OUT",
        checkInAt: existing.created_at,
        checkOutAt,
        fullName: existingAttendee?.full_name || null,
        baseName: existingAttendee?.base_name || null,
      };
    }

    // Ensure attendee is registered in directory before first CHECK_IN
    if (!existingAttendee) {
      const cleanName = String(input.fullName || "").trim() || `Asistente ${dni}`;
      const cleanBase = String(input.baseName || "").trim() || "Base General";

      const insAtt = db.prepare(`
        INSERT INTO attendees (dni, full_name, base_name, created_at, updated_at)
        VALUES ($dni, $full_name, $base_name, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        ON CONFLICT(dni) DO UPDATE SET
          full_name = excluded.full_name,
          base_name = excluded.base_name,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        RETURNING *;
      `);
      existingAttendee = insAtt.get({
        $dni: dni,
        $full_name: cleanName,
        $base_name: cleanBase,
      }) as Attendee;
    } else if (input.fullName && input.baseName) {
      const cleanName = String(input.fullName).trim();
      const cleanBase = String(input.baseName).trim();
      if (cleanName.length >= 2 && cleanBase.length >= 2) {
        db.prepare(`
          UPDATE attendees
          SET full_name = $full_name, base_name = $base_name, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
          WHERE dni = $dni;
        `).run({ $dni: dni, $full_name: cleanName, $base_name: cleanBase });
        existingAttendee.full_name = cleanName;
        existingAttendee.base_name = cleanBase;
      }
    }

    // 8. Record CHECK_IN (Entrada) - Atomic Insert
    const method = input.method || "SELF";

    const insertStmt = db.prepare(`
      INSERT INTO attendances (
        event_id,
        dni,
        latitude,
        longitude,
        accuracy_meters,
        distance_meters,
        method,
        ip_address,
        user_agent,
        recorded_by_user_id
      ) VALUES (
        $event_id,
        $dni,
        $latitude,
        $longitude,
        $accuracy_meters,
        $distance_meters,
        $method,
        $ip_address,
        $user_agent,
        $recorded_by_user_id
      ) RETURNING id, created_at;
    `);

    let result: { id: number; created_at: string };
    try {
      result = insertStmt.get({
        $event_id: event.id,
        $dni: dni,
        $latitude: input.latitude,
        $longitude: input.longitude,
        $accuracy_meters: input.accuracy,
        $distance_meters: distanceMeters,
        $method: method,
        $ip_address: input.ipAddress || "127.0.0.1",
        $user_agent: input.userAgent || "Unknown",
        $recorded_by_user_id: input.recordedByUserId || null,
      }) as { id: number; created_at: string };
    } catch (err: any) {
      if (
        err?.message?.includes("UNIQUE constraint failed") ||
        err?.code === "SQLITE_CONSTRAINT_UNIQUE" ||
        err?.code === "SQLITE_CONSTRAINT"
      ) {
        throw new AttendanceAlreadyRegisteredError(dni);
      }
      throw err;
    }

    return {
      attendanceId: result.id,
      event,
      dni,
      distanceMeters,
      recordedAt: result.created_at,
      action: "CHECK_IN",
      checkInAt: result.created_at,
      fullName: existingAttendee?.full_name || null,
      baseName: existingAttendee?.base_name || null,
    };
  }

  /**
   * Get an attendance record by eventId and DNI
   */
  public static getByEventAndDni(eventId: number, dni: string): (Attendance & { attendee_name?: string | null; attendee_base?: string | null }) | null {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT 
        a.*,
        att.full_name as attendee_name,
        att.base_name as attendee_base
      FROM attendances a
      LEFT JOIN attendees att ON a.dni = att.dni
      WHERE a.event_id = $event_id AND a.dni = $dni;
    `);
    const record = stmt.get({ $event_id: eventId, $dni: dni }) as (Attendance & { attendee_name?: string | null; attendee_base?: string | null }) | undefined;
    return record || null;
  }

  /**
   * Get all attendances registered for an event with optional cursor pagination
   */
  public static getByEventId(eventId: number, options?: PaginationOptions): AttendanceWithAttendee[] {
    const db = getDatabase();
    let query = `
      SELECT 
        a.*,
        att.full_name as attendee_name,
        att.base_name as attendee_base
      FROM attendances a
      LEFT JOIN attendees att ON a.dni = att.dni
      WHERE a.event_id = $event_id
    `;
    const params: Record<string, any> = { $event_id: eventId };

    if (options?.cursor != null && !isNaN(options.cursor)) {
      query += " AND a.id < $cursor";
      params.$cursor = Number(options.cursor);
    }

    query += " ORDER BY a.id DESC";

    if (options?.limit != null && options.limit > 0) {
      query += " LIMIT $limit";
      params.$limit = Number(options.limit);
    }

    return db.prepare(query).all(params) as AttendanceWithAttendee[];
  }

  /**
   * Get all attendances globally across all events with event title and code, with optional cursor pagination
   */
  public static getAllWithEventInfo(options?: PaginationOptions): AttendanceWithEvent[] {
    const db = getDatabase();
    let query = `
      SELECT 
        a.*,
        e.title as event_title,
        e.public_code as event_public_code,
        att.full_name as attendee_name,
        att.base_name as attendee_base
      FROM attendances a
      JOIN events e ON a.event_id = e.id
      LEFT JOIN attendees att ON a.dni = att.dni
    `;
    const params: Record<string, any> = {};

    if (options?.cursor != null && !isNaN(options.cursor)) {
      query += " WHERE a.id < $cursor";
      params.$cursor = Number(options.cursor);
    }

    query += " ORDER BY a.id DESC";

    if (options?.limit != null && options.limit > 0) {
      query += " LIMIT $limit";
      params.$limit = Number(options.limit);
    }

    return db.prepare(query).all(params) as AttendanceWithEvent[];
  }

  /**
   * Get total count of attendances (globally or by eventId)
   */
  public static getTotalCount(eventId?: number): number {
    const db = getDatabase();
    if (eventId != null) {
      const result = db.prepare("SELECT COUNT(*) as count FROM attendances WHERE event_id = $event_id").get({ $event_id: eventId }) as { count: number };
      return result?.count ?? 0;
    }
    const result = db.prepare("SELECT COUNT(*) as count FROM attendances").get() as { count: number };
    return result?.count ?? 0;
  }

  /**
   * Delete an attendance record by ID
   */
  public static delete(id: number): boolean {
    const db = getDatabase();
    db.prepare("DELETE FROM attendances WHERE id = $id").run({ $id: id });
    return true;
  }
}
