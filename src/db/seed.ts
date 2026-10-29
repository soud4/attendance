import { Database } from "bun:sqlite";
import { getDatabase, initSchema } from "./index";

export function seedDemoEvent(db: Database): void {
  // Check if demo event already exists
  const existing = db
    .prepare("SELECT id FROM events WHERE public_code = 'ev-demo2026'")
    .get();

  if (!existing) {
    db.run(`
      INSERT INTO events (
        public_code,
        title,
        location_name,
        latitude,
        longitude,
        radius_meters,
        starts_at,
        ends_at,
        status
      ) VALUES (
        'ev-demo2026',
        'Conferencia Anual de Operaciones 2026',
        'Auditorio Central - Sede Lima',
        -12.046374,
        -77.042793,
        150,
        '08:30 AM',
        '06:00 PM',
        'OPEN'
      );
    `);
    console.log("Evento demo inicializado: /asistir/ev-demo2026");
  }
}

// When executed directly:
if (import.meta.main) {
  const db = getDatabase();
  initSchema(db);
  seedDemoEvent(db);
}
