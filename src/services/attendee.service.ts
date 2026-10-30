import { getDatabase, type Attendee } from "../db";
import { DNI_REGEX } from "../config";
import { InvalidDniError, ValidationError } from "./errors";

export class AttendeeService {
  /**
   * Find an attendee by their 8-digit DNI
   */
  public static findByDni(dni: string): Attendee | null {
    const cleanDni = String(dni || "").trim();
    if (!cleanDni || !DNI_REGEX.test(cleanDni)) {
      return null;
    }

    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM attendees WHERE dni = $dni LIMIT 1;");
    const attendee = stmt.get({ $dni: cleanDni }) as Attendee | undefined;
    return attendee || null;
  }

  /**
   * Create or update an attendee in the directory (padrón)
   */
  public static upsert(dni: string, fullName: string, baseName: string): Attendee {
    const cleanDni = String(dni || "").trim();
    const cleanName = String(fullName || "").trim();
    const cleanBase = String(baseName || "").trim();

    if (!DNI_REGEX.test(cleanDni)) {
      throw new InvalidDniError("El DNI debe contener exactamente 8 dígitos numéricos.");
    }

    if (!cleanName || cleanName.length < 2) {
      throw new ValidationError("El nombre completo debe tener al menos 2 caracteres.");
    }

    if (!cleanBase || cleanBase.length < 2) {
      throw new ValidationError("La base o filial debe tener al menos 2 caracteres.");
    }

    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO attendees (dni, full_name, base_name, created_at, updated_at)
      VALUES ($dni, $full_name, $base_name, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      ON CONFLICT(dni) DO UPDATE SET
        full_name = excluded.full_name,
        base_name = excluded.base_name,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      RETURNING *;
    `);

    return stmt.get({
      $dni: cleanDni,
      $full_name: cleanName,
      $base_name: cleanBase,
    }) as Attendee;
  }

  /**
   * Retrieve all attendees from the directory
   */
  public static getAll(): Attendee[] {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM attendees ORDER BY full_name ASC;");
    return stmt.all() as Attendee[];
  }
}
