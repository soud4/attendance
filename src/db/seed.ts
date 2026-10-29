import { Database } from "bun:sqlite";
import { getDatabase, initSchema } from "./index";

export function seedAdminUser(db: Database): void {
  const existing = db
    .prepare("SELECT id FROM users WHERE identifier = '00000000'")
    .get();

  if (!existing) {
    // Password 'admin123' hashed with Argon2id
    const defaultHash = "$argon2id$v=19$m=65536,t=2,p=1$qBRIedce3uwoOxj3U8FimNkvqGevcCorPXmptrMNgMM$46OCPeMmZMl2MWw1lSAIYIM8IiqxGQEoKOOH1blRRKY";

    db.run(
      `
      INSERT INTO users (
        identifier,
        password_hash,
        full_name,
        role,
        status
      ) VALUES (
        '00000000',
        ?,
        'Administrador Principal',
        'ADMIN',
        'ACTIVE'
      );
    `,
      [defaultHash]
    );

    console.log("Usuario Administrador inicial creado: DNI 00000000 / admin123");
  }
}

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
  seedAdminUser(db);
  seedDemoEvent(db);
}
