import { getDatabase, type Event, type Attendance } from "../db";
import {
  EventNotFoundError,
  ValidationError,
  InvalidCoordinatesError,
  InvalidRadiusError,
} from "./errors";
import {
  MIN_RADIUS_METERS,
  MAX_RADIUS_METERS,
  DEFAULT_RADIUS_METERS,
  EVENT_CODE_PREFIX,
  EVENT_CODE_CHARS,
  EVENT_CODE_RANDOM_LENGTH,
} from "../config";

export interface EventWithStats extends Event {
  attendee_count: number;
}

export interface CreateEventInput {
  title: string;
  location_name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  starts_at?: string | null;
  ends_at?: string | null;
  created_by_user_id?: number | null;
}

export interface UpdateEventInput {
  title: string;
  location_name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  starts_at?: string | null;
  ends_at?: string | null;
  status?: "OPEN" | "CLOSED" | "DRAFT";
}

/**
 * Check if an event's schedule has expired based on its ends_at setting and current time
 */
export function isEventExpired(event: Event): boolean {
  if (!event.ends_at || !event.ends_at.trim()) {
    return false;
  }

  const rawEnd = event.ends_at.trim();

  // 1. Full date/datetime with 4-digit year (e.g. "2026-10-29T18:00", "2026-10-29 18:00:00")
  if (/\d{4}/.test(rawEnd)) {
    const parsed = new Date(rawEnd);
    if (!isNaN(parsed.getTime())) {
      return Date.now() > parsed.getTime();
    }
  }

  // 2. Simple time format (e.g. "18:00", "18:00:00", "06:00 PM", "6:30 pm")
  const timeMatch = rawEnd.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]!, 10);
    const minutes = parseInt(timeMatch[2]!, 10);
    const seconds = timeMatch[3] ? parseInt(timeMatch[3]!, 10) : 0;
    const meridian = timeMatch[4] ? timeMatch[4].toUpperCase() : null;

    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;

    // Base date from starts_at if it contains a year, otherwise created_at, otherwise current date
    let baseYear: number;
    let baseMonth: number;
    let baseDay: number;

    const dateCandidate =
      (event.starts_at && /\d{4}/.test(event.starts_at) ? event.starts_at : null) ||
      (event.created_at && /\d{4}/.test(event.created_at) ? event.created_at : null);

    if (dateCandidate) {
      const matchDate = dateCandidate.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (matchDate) {
        baseYear = parseInt(matchDate[1]!, 10);
        baseMonth = parseInt(matchDate[2]!, 10) - 1;
        baseDay = parseInt(matchDate[3]!, 10);
      } else {
        const d = new Date(dateCandidate);
        baseYear = d.getFullYear();
        baseMonth = d.getMonth();
        baseDay = d.getDate();
      }
    } else {
      const now = new Date();
      baseYear = now.getFullYear();
      baseMonth = now.getMonth();
      baseDay = now.getDate();
    }

    const expiryDate = new Date(baseYear, baseMonth, baseDay, hours, minutes, seconds, 0);
    return Date.now() > expiryDate.getTime();
  }

  // 3. Fallback standard Date parsing
  const fallbackDate = new Date(rawEnd);
  if (!isNaN(fallbackDate.getTime())) {
    return Date.now() > fallbackDate.getTime();
  }

  return false;
}

/**
 * Check if an open event has expired and automatically update its status to CLOSED in DB
 */
export function checkAutoClose<T extends Event>(event: T): T {
  if (event.status === "OPEN" && isEventExpired(event)) {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE events
      SET status = 'CLOSED', closed_at = COALESCE(closed_at, $closed_at)
      WHERE id = $id AND status = 'OPEN'
    `).run({
      $closed_at: now,
      $id: event.id,
    });

    return {
      ...event,
      status: "CLOSED",
      closed_at: event.closed_at || now,
    };
  }
  return event;
}

export interface EventPaginationOptions {
  cursor?: number | null;
  limit?: number | null;
}

export class EventService {
  public static isEventExpired = isEventExpired;
  public static checkAutoClose = checkAutoClose;

  // In-memory O(1) set of known public event codes to avoid redundant DB queries
  private static knownCodes = new Set<string>();
  private static cachedDbRef: any = null;

  public static invalidateCache(): void {
    this.cachedDbRef = null;
    this.knownCodes.clear();
  }

  private static ensureCacheInitialized(): void {
    const db = getDatabase();
    if (this.cachedDbRef !== db) {
      const rows = db.prepare("SELECT public_code FROM events").all() as { public_code: string }[];
      this.knownCodes = new Set(rows.map((r) => r.public_code));
      this.cachedDbRef = db;
    }
  }

  /**
   * Check in memory in O(1) if a public code exists without querying SQLite
   */
  public static codeExists(code: string): boolean {
    if (!code || typeof code !== "string") return false;
    this.ensureCacheInitialized();
    return this.knownCodes.has(code);
  }

  /**
   * Helper to generate a unique public code (e.g. ev-m8x2p4)
   */
  private static generatePublicCode(): string {
    let random = "";
    for (let i = 0; i < EVENT_CODE_RANDOM_LENGTH; i++) {
      random += EVENT_CODE_CHARS.charAt(Math.floor(Math.random() * EVENT_CODE_CHARS.length));
    }
    return `${EVENT_CODE_PREFIX}${random}`;
  }

  /**
   * List all events ordered by newest first with attendee counts, supporting optional cursor pagination and auto-close check
   */
  public static getAllWithStats(options?: EventPaginationOptions): EventWithStats[] {
    const db = getDatabase();
    let query = `
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM attendances a WHERE a.event_id = e.id) as attendee_count
      FROM events e
    `;
    const params: Record<string, any> = {};

    if (options?.cursor != null && !isNaN(options.cursor)) {
      query += " WHERE e.id < $cursor";
      params.$cursor = Number(options.cursor);
    }

    query += " ORDER BY e.id DESC";

    if (options?.limit != null && options.limit > 0) {
      query += " LIMIT $limit";
      params.$limit = Number(options.limit);
    }

    const events = db.prepare(query).all(params) as EventWithStats[];
    return events.map((e) => {
      const updated = checkAutoClose(e);
      return { ...e, ...updated, attendee_count: e.attendee_count };
    });
  }

  /**
   * Total count of events
   */
  public static getTotalCount(): number {
    const db = getDatabase();
    const res = db.prepare("SELECT COUNT(*) as count FROM events").get() as { count: number };
    return res?.count ?? 0;
  }

  /**
   * Get an event by its numeric primary key with auto-close check
   */
  public static getById(id: number): Event | null {
    const db = getDatabase();
    const event = db
      .prepare("SELECT * FROM events WHERE id = $id")
      .get({ $id: id }) as Event | null;

    if (!event) return null;
    return checkAutoClose(event);
  }

  /**
   * Get an event with its full list of registered attendances and auto-close check
   */
  public static getWithAttendances(
    id: number,
    options?: EventPaginationOptions
  ): { event: EventWithStats; attendances: Attendance[] } {
    const db = getDatabase();
    let event = db
      .prepare(`
        SELECT 
          e.*,
          (SELECT COUNT(*) FROM attendances a WHERE a.event_id = e.id) as attendee_count
        FROM events e
        WHERE e.id = $id
      `)
      .get({ $id: id }) as EventWithStats | null;

    if (!event) {
      throw new EventNotFoundError(id);
    }

    event = { ...event, ...checkAutoClose(event) };

    let query = "SELECT * FROM attendances WHERE event_id = $id";
    const params: Record<string, any> = { $id: id };

    if (options?.cursor != null && !isNaN(options.cursor)) {
      query += " AND id < $cursor";
      params.$cursor = Number(options.cursor);
    }

    query += " ORDER BY id DESC";

    if (options?.limit != null && options.limit > 0) {
      query += " LIMIT $limit";
      params.$limit = Number(options.limit);
    }

    const attendances = db.prepare(query).all(params) as Attendance[];

    return { event, attendances };
  }

  /**
   * Get an event by its unique public code (e.g. 'ev-demo2026') with in-memory check & auto-close
   */
  public static getByPublicCode(publicCode: string): Event | null {
    if (!this.codeExists(publicCode)) {
      return null;
    }
    const db = getDatabase();
    const event = db
      .prepare("SELECT * FROM events WHERE public_code = $code")
      .get({ $code: publicCode }) as Event | null;

    if (!event) return null;
    return checkAutoClose(event);
  }

  /**
   * Create a new event with input validation and auto-generated unique code
   */
  public static create(input: CreateEventInput): Event {
    const title = input.title.trim();
    const locationName = input.location_name.trim();

    if (!title) {
      throw new ValidationError("Por favor ingresa el título del evento.");
    }

    if (!locationName) {
      throw new ValidationError("Por favor ingresa el nombre de la sede o lugar.");
    }

    if (
      isNaN(input.latitude) ||
      input.latitude < -90 ||
      input.latitude > 90 ||
      isNaN(input.longitude) ||
      input.longitude < -180 ||
      input.longitude > 180
    ) {
      throw new InvalidCoordinatesError();
    }

    if (input.radius_meters < MIN_RADIUS_METERS || input.radius_meters > MAX_RADIUS_METERS) {
      throw new InvalidRadiusError();
    }

    const db = getDatabase();
    let publicCode = this.generatePublicCode();

    // Ensure code uniqueness using in-memory set (0 DB queries)
    while (this.codeExists(publicCode)) {
      publicCode = this.generatePublicCode();
    }

    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO events (
        public_code,
        title,
        location_name,
        latitude,
        longitude,
        radius_meters,
        starts_at,
        ends_at,
        status,
        created_by_user_id,
        opened_at,
        created_at
      ) VALUES (
        $public_code,
        $title,
        $location_name,
        $latitude,
        $longitude,
        $radius_meters,
        $starts_at,
        $ends_at,
        'OPEN',
        $created_by_user_id,
        $opened_at,
        $created_at
      )
    `).run({
      $public_code: publicCode,
      $title: title,
      $location_name: locationName,
      $latitude: input.latitude,
      $longitude: input.longitude,
      $radius_meters: input.radius_meters,
      $starts_at: input.starts_at || null,
      $ends_at: input.ends_at || null,
      $created_by_user_id: input.created_by_user_id || null,
      $opened_at: now,
      $created_at: now,
    });

    const created = db
      .prepare("SELECT * FROM events WHERE public_code = $code")
      .get({ $code: publicCode }) as Event | null;
    if (!created) {
      throw new Error("No se pudo recuperar el evento recién creado.");
    }
    this.knownCodes.add(publicCode);
    return created;
  }

  /**
   * Update an existing event
   */
  public static update(id: number, input: UpdateEventInput): Event {
    const existing = this.getById(id);
    if (!existing) {
      throw new EventNotFoundError(id);
    }

    const title = input.title.trim();
    const locationName = input.location_name.trim();

    if (!title) {
      throw new ValidationError("Por favor ingresa el título del evento.");
    }

    if (!locationName) {
      throw new ValidationError("Por favor ingresa el nombre de la sede o lugar.");
    }

    if (
      isNaN(input.latitude) ||
      input.latitude < -90 ||
      input.latitude > 90 ||
      isNaN(input.longitude) ||
      input.longitude < -180 ||
      input.longitude > 180
    ) {
      throw new InvalidCoordinatesError();
    }

    if (input.radius_meters < MIN_RADIUS_METERS || input.radius_meters > MAX_RADIUS_METERS) {
      throw new InvalidRadiusError();
    }

    const db = getDatabase();
    db.prepare(`
      UPDATE events
      SET 
        title = $title,
        location_name = $location_name,
        latitude = $latitude,
        longitude = $longitude,
        radius_meters = $radius_meters,
        starts_at = $starts_at,
        ends_at = $ends_at,
        status = COALESCE($status, status)
      WHERE id = $id
    `).run({
      $title: title,
      $location_name: locationName,
      $latitude: input.latitude,
      $longitude: input.longitude,
      $radius_meters: input.radius_meters,
      $starts_at: input.starts_at || null,
      $ends_at: input.ends_at || null,
      $status: input.status || null,
      $id: id,
    });

    return this.getById(id)!;
  }

  /**
   * Delete an event and all its attendances inside an atomic transaction
   */
  public static delete(id: number): boolean {
    const existing = this.getById(id);
    if (!existing) {
      throw new EventNotFoundError(id);
    }

    const db = getDatabase();
    const deleteTx = db.transaction(() => {
      // 1. Delete associated attendances
      db.prepare("DELETE FROM attendances WHERE event_id = $id").run({ $id: id });
      // 2. Delete the event
      db.prepare("DELETE FROM events WHERE id = $id").run({ $id: id });
    });

    deleteTx();
    this.knownCodes.delete(existing.public_code);
    return true;
  }

  /**
   * Toggle event status between OPEN and CLOSED
   */
  public static toggleStatus(id: number): { event: Event; newStatus: "OPEN" | "CLOSED" } {
    const db = getDatabase();
    const event = this.getById(id);

    if (!event) {
      throw new EventNotFoundError(id);
    }

    const now = new Date().toISOString();
    const newStatus: "OPEN" | "CLOSED" = event.status === "OPEN" ? "CLOSED" : "OPEN";
    const openedAt = newStatus === "OPEN" ? now : null;
    const closedAt = newStatus === "CLOSED" ? now : null;

    db.prepare(`
      UPDATE events
      SET 
        status = $status,
        opened_at = COALESCE($opened_at, opened_at),
        closed_at = COALESCE($closed_at, closed_at)
      WHERE id = $id
    `).run({
      $status: newStatus,
      $opened_at: openedAt,
      $closed_at: closedAt,
      $id: id,
    });

    const updated = this.getById(id)!;
    return { event: updated, newStatus };
  }
}
