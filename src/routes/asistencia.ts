import { Hono } from "hono";
import { getDatabase, type Event } from "../db";
import { calculateDistanceMeters } from "../utils/geo";
import { renderAttendanceView } from "../views/asistencia";

export const asistenciaRoute = new Hono();

// 1. Render Public Form View
asistenciaRoute.get("/asistir/:code", (c) => {
  const code = c.req.param("code");
  const db = getDatabase();

  const event = db
    .prepare("SELECT * FROM events WHERE public_code = $code")
    .get({ $code: code }) as Event | null;

  if (!event) {
    return c.html(
      `<!DOCTYPE html>
<html lang="es" class="h-full bg-slate-950">
<head>
  <meta charset="UTF-8">
  <title>Evento no encontrado</title>
  <link rel="stylesheet" href="/css/tailwind.css">
</head>
<body class="min-h-full flex items-center justify-center p-6 bg-slate-950 text-slate-100 font-sans">
  <div class="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-none text-center">
    <div class="w-12 h-12 bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto rounded-none mb-4">
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </div>
    <h1 class="text-xl font-bold text-white">Evento no encontrado</h1>
    <p class="mt-2 text-xs text-slate-400 leading-relaxed">
      El enlace o código de evento no existe o ha expirado. Por favor solicita el enlace oficial a tu coordinador.
    </p>
  </div>
</body>
</html>`,
      404
    );
  }

  return c.html(renderAttendanceView(event));
});

// 1.1 Quick JSON Status Check (for refresh button & live verification)
asistenciaRoute.get("/asistir/:code/status", (c) => {
  const code = c.req.param("code");
  const db = getDatabase();

  const event = db
    .prepare("SELECT * FROM events WHERE public_code = $code")
    .get({ $code: code }) as Event | null;

  if (!event) {
    return c.json({ success: false, error: "Evento no encontrado" }, 404);
  }

  return c.json({
    success: true,
    status: event.status,
    is_open: event.status === "OPEN",
    title: event.title,
    location_name: event.location_name,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
  });
});

// 2. Process Public Attendance POST with Full Verification
asistenciaRoute.post("/asistir/:code", async (c) => {
  const code = c.req.param("code");
  const db = getDatabase();

  // Parse JSON Body
  let body: {
    dni?: string;
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json(
      {
        success: false,
        title: "Petición inválida",
        error: "Los datos enviados no tienen un formato JSON válido.",
      },
      400
    );
  }

  const { dni, latitude, longitude, accuracy } = body;

  // Strict DNI check: exactly 8 numeric digits
  if (typeof dni !== "string" || !/^\d{8}$/.test(dni)) {
    return c.json(
      {
        success: false,
        title: "DNI no válido",
        error: "El DNI debe contener exactamente 8 dígitos numéricos sin letras ni símbolos.",
      },
      400
    );
  }

  // Geographic coordinates numeric verification
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    typeof accuracy !== "number" ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    accuracy < 0
  ) {
    return c.json(
      {
        success: false,
        title: "Ubicación inválida",
        error: "Las coordenadas GPS proporcionadas son inválidas o están fuera de rango.",
      },
      400
    );
  }

  // Event existence and status check
  const event = db
    .prepare("SELECT * FROM events WHERE public_code = $code")
    .get({ $code: code }) as Event | null;

  if (!event) {
    return c.json(
      {
        success: false,
        title: "Evento no encontrado",
        error: "El evento solicitado no existe.",
      },
      404
    );
  }

  if (event.status !== "OPEN") {
    return c.json(
      {
        success: false,
        title: "El registro ha finalizado",
        error: "El registro para este evento ha finalizado o se encuentra cerrado.",
      },
      400
    );
  }

  // Haversine Distance Calculation & Radius Check
  const distance = calculateDistanceMeters(
    event.latitude,
    event.longitude,
    latitude,
    longitude
  );

  if (distance > event.radius_meters) {
    return c.json(
      {
        success: false,
        title: "Fuera de la zona del evento",
        error: `Te encuentras a aproximadamente ${distance} metros del evento. El radio máximo permitido para registrar asistencia es de ${event.radius_meters} metros.`,
        details: {
          distance_meters: distance,
          allowed_radius_meters: event.radius_meters,
        },
      },
      400
    );
  }

  // Duplicate Attendance Check for this Event and DNI
  const existing = db
    .prepare("SELECT id, created_at FROM attendances WHERE event_id = $event_id AND dni = $dni")
    .get({ $event_id: event.id, $dni: dni }) as { id: number; created_at: string } | null;

  if (existing) {
    return c.json(
      {
        success: false,
        title: "Asistencia ya registrada",
        error: `El DNI ${dni} ya cuenta con asistencia confirmada para este evento.`,
        details: {
          registered_at: existing.created_at,
        },
      },
      409
    );
  }

  // Device context metadata
  const ipAddress =
    c.req.header("x-forwarded-for") || c.req.header("cf-connecting-ip") || "127.0.0.1";
  const userAgent = c.req.header("user-agent") || "Unknown";

  // Insert Attendance securely
  try {
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
        user_agent
      ) VALUES (
        $event_id,
        $dni,
        $latitude,
        $longitude,
        $accuracy_meters,
        $distance_meters,
        'SELF',
        $ip_address,
        $user_agent
      ) RETURNING id, created_at;
    `);

    const result = insertStmt.get({
      $event_id: event.id,
      $dni: dni,
      $latitude: latitude,
      $longitude: longitude,
      $accuracy_meters: accuracy,
      $distance_meters: distance,
      $ip_address: ipAddress,
      $user_agent: userAgent,
    }) as { id: number; created_at: string };

    return c.json({
      success: true,
      message: "Asistencia registrada correctamente",
      details: {
        id: result.id,
        dni: dni,
        time: new Date().toLocaleTimeString("es-PE", { hour12: true }),
        distance: `${distance} metros`,
      },
    });
  } catch (dbError: any) {
    // Catch database constraints or triggers
    if (dbError.message?.includes("UNIQUE constraint failed")) {
      return c.json(
        {
          success: false,
          title: "Asistencia duplicada",
          error: "Ya existe un registro para este DNI en este evento.",
        },
        409
      );
    }

    return c.json(
      {
        success: false,
        title: "Error al guardar",
        error: dbError.message || "No se pudo registrar la asistencia en la base de datos.",
      },
      500
    );
  }
});
