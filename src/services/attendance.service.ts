import { getDatabase, type Attendance, type Event } from "../db";
import {
  InvalidDniError,
  InvalidCoordinatesError,
  EventNotFoundError,
  EventClosedError,
  OutOfRadiusError,
  AttendanceAlreadyRegisteredError,
} from "./errors";

export interface RegisterAttendanceInput {
  eventPublicCode: string;
  dni: string;
  latitude: number;
  longitude: number;
  accuracy: number;
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
}

export interface AttendanceWithEvent extends Attendance {
  event_title: string;
  event_public_code: string;
}

export class AttendanceService {
  /**
   * Calculate distance between two coordinates in meters using the Haversine formula
   */
  public static calculateDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth radius in meters
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
   * Register attendance for an attendee with full business validations
   */
  public static register(input: RegisterAttendanceInput): AttendanceResult {
    const dni = String(input.dni || "").trim();

    // 1. Strict DNI Validation (8 digits)
    if (!/^\d{8}$/.test(dni)) {
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

    // 3. Find event
    const event = db
      .prepare("SELECT * FROM events WHERE public_code = $code")
      .get({ $code: input.eventPublicCode }) as Event | null;

    if (!event) {
      throw new EventNotFoundError(input.eventPublicCode);
    }

    // 4. Validate event status is OPEN
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

    if (distanceMeters > event.radius_meters) {
      throw new OutOfRadiusError(distanceMeters, event.radius_meters);
    }

    // 6. Check for duplicate registration
    const existing = db
      .prepare("SELECT id, created_at FROM attendances WHERE event_id = $event_id AND dni = $dni")
      .get({ $event_id: event.id, $dni: dni }) as { id: number; created_at: string } | null;

    if (existing) {
      throw new AttendanceAlreadyRegisteredError(dni);
    }

    // 7. Insert Attendance Record
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

    const result = insertStmt.get({
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

    return {
      attendanceId: result.id,
      event,
      dni,
      distanceMeters,
      recordedAt: result.created_at,
    };
  }

  /**
   * Get all attendances registered for an event
   */
  public static getByEventId(eventId: number): Attendance[] {
    const db = getDatabase();
    return db
      .prepare("SELECT * FROM attendances WHERE event_id = $event_id ORDER BY id DESC")
      .all({ $event_id: eventId }) as Attendance[];
  }

  /**
   * Get all attendances globally across all events with event title and code
   */
  public static getAllWithEventInfo(): AttendanceWithEvent[] {
    const db = getDatabase();
    return db
      .prepare(`
        SELECT 
          a.*,
          e.title as event_title,
          e.public_code as event_public_code
        FROM attendances a
        JOIN events e ON a.event_id = e.id
        ORDER BY a.id DESC
      `)
      .all() as AttendanceWithEvent[];
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
