-- Pragmas for WAL mode and integrity enforcement
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;

-- 1. Users table (Admin & Staff)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STAFF' CHECK (role IN ('ADMIN', 'STAFF')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

-- 2. Events table
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    location_name TEXT NOT NULL DEFAULT '',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 100 CHECK (radius_meters >= 10 AND radius_meters <= 5000),
    starts_at TEXT,
    ends_at TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED')),
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    opened_at TEXT,
    closed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    CHECK (latitude >= -90.0 AND latitude <= 90.0),
    CHECK (longitude >= -180.0 AND longitude <= 180.0)
) STRICT;

CREATE INDEX IF NOT EXISTS idx_events_public_code ON events(public_code);

-- 3. Attendances table (Prototype)
CREATE TABLE IF NOT EXISTS attendances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
    dni TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy_meters REAL NOT NULL,
    distance_meters REAL NOT NULL,
    method TEXT NOT NULL DEFAULT 'SELF' CHECK (method IN ('SELF', 'ASSISTED')),
    recorded_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    device_cookie_hash TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    -- Constraints
    UNIQUE (event_id, dni),
    CHECK (length(dni) = 8 AND dni NOT GLOB '*[^0-9]*'),
    CHECK (latitude >= -90.0 AND latitude <= 90.0),
    CHECK (longitude >= -180.0 AND longitude <= 180.0),
    CHECK (accuracy_meters >= 0),
    CHECK (distance_meters >= 0),
    CHECK (method != 'ASSISTED' OR recorded_by_user_id IS NOT NULL)
) STRICT;

CREATE INDEX IF NOT EXISTS idx_attendances_event_dni ON attendances(event_id, dni);
CREATE INDEX IF NOT EXISTS idx_attendances_dni ON attendances(dni);

-- 4. Trigger: Prevent recording attendance if event is not OPEN
CREATE TRIGGER IF NOT EXISTS trg_block_attendance_when_not_open
BEFORE INSERT ON attendances
FOR EACH ROW
WHEN (SELECT status FROM events WHERE id = NEW.event_id) != 'OPEN'
BEGIN
    SELECT RAISE(ABORT, 'Rejected: Event is not open for attendance registration.');
END;
