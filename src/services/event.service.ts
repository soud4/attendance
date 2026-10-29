import { getDatabase, type Event } from "../db";
import {
  EventNotFoundError,
  ValidationError,
  InvalidCoordinatesError,
  InvalidRadiusError,
} from "./errors";

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

export class EventService {
  /**
   * Helper to generate a unique public code (e.g. ev-m8x2p4)
   */
  private static generatePublicCode(): string {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let random = "";
    for (let i = 0; i < 6; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ev-${random}`;
  }

  /**
   * List all events ordered by newest first with attendee counts
   */
  public static getAllWithStats(): EventWithStats[] {
    const db = getDatabase();
    return db
      .prepare(`
        SELECT 
          e.*,
          (SELECT COUNT(*) FROM attendances a WHERE a.event_id = e.id) as attendee_count
        FROM events e
        ORDER BY e.id DESC
      `)
      .all() as EventWithStats[];
  }

  /**
   * Get an event by its numeric primary key
   */
  public static getById(id: number): Event | null {
    const db = getDatabase();
    return db
      .prepare("SELECT * FROM events WHERE id = $id")
      .get({ $id: id }) as Event | null;
  }

  /**
   * Get an event by its unique public code (e.g. 'ev-demo2026')
   */
  public static getByPublicCode(publicCode: string): Event | null {
    const db = getDatabase();
    return db
      .prepare("SELECT * FROM events WHERE public_code = $code")
      .get({ $code: publicCode }) as Event | null;
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

    if (input.radius_meters < 10 || input.radius_meters > 5000) {
      throw new InvalidRadiusError();
    }

    const db = getDatabase();
    let publicCode = this.generatePublicCode();

    // Ensure code uniqueness
    while (db.prepare("SELECT id FROM events WHERE public_code = $code").get({ $code: publicCode })) {
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

    const created = this.getByPublicCode(publicCode);
    if (!created) {
      throw new Error("No se pudo recuperar el evento recién creado.");
    }
    return created;
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
