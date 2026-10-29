import { Hono } from "hono";
import { getDatabase, type Event } from "../../db";
import { authMiddleware, requireAdmin, type UserSession } from "../../utils/auth";
import { renderAdminLayout } from "../../views/layouts/admin_layout";
import { renderDashboardView, type EventWithStats } from "../../views/admin/dashboard_view";
import { renderEventFormView } from "../../views/admin/event_form_view";

type Env = {
  Variables: {
    user: UserSession;
  };
};

export const adminEventsRoute = new Hono<Env>();

// Apply auth protection to all /admin routes
adminEventsRoute.use("*", authMiddleware);

// Helper to generate public code (e.g. ev-m8x2p4)
function generatePublicCode(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ev-${random}`;
}

// 1. Dashboard: List Events
adminEventsRoute.get("/", (c) => {
  const user = c.get("user");
  const db = getDatabase();
  const notice = c.req.query("notice");

  const events = db
    .prepare(`
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM attendances a WHERE a.event_id = e.id) as attendee_count
      FROM events e
      ORDER BY e.id DESC
    `)
    .all() as EventWithStats[];

  const content = renderDashboardView(events, notice);
  return c.html(renderAdminLayout("Dashboard de Eventos", user, content));
});

// 2. New Event Form View
adminEventsRoute.get("/events/new", (c) => {
  const user = c.get("user");
  const content = renderEventFormView();
  return c.html(renderAdminLayout("Nuevo Evento", user, content));
});

// 3. Create Event Handler (Admin only)
adminEventsRoute.post("/events", requireAdmin, async (c) => {
  const user = c.get("user");
  const body = await c.req.parseBody();

  const title = String(body.title || "").trim();
  const locationName = String(body.location_name || "").trim();
  const latStr = String(body.latitude || "").trim();
  const lonStr = String(body.longitude || "").trim();
  const radiusMeters = Number(body.radius_meters) || 100;
  const startsAt = String(body.starts_at || "").trim();
  const endsAt = String(body.ends_at || "").trim();

  // Validations
  if (!title) {
    const content = renderEventFormView("Por favor ingresa el título del evento.", body);
    return c.html(renderAdminLayout("Nuevo Evento", user, content), 400);
  }

  if (!locationName) {
    const content = renderEventFormView("Por favor ingresa el nombre de la sede o lugar.", body);
    return c.html(renderAdminLayout("Nuevo Evento", user, content), 400);
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lon) || lon < -180 || lon > 180) {
    const content = renderEventFormView(
      "Coordenadas geográficas inválidas. Usa el botón 'Usar mi ubicación actual' o escribe valores válidos.",
      body
    );
    return c.html(renderAdminLayout("Nuevo Evento", user, content), 400);
  }

  if (radiusMeters < 10 || radiusMeters > 5000) {
    const content = renderEventFormView("El radio de cobertura debe estar entre 10 y 5000 metros.", body);
    return c.html(renderAdminLayout("Nuevo Evento", user, content), 400);
  }

  const db = getDatabase();
  let publicCode = generatePublicCode();

  // Ensure publicCode is unique
  while (db.prepare("SELECT id FROM events WHERE public_code = $code").get({ $code: publicCode })) {
    publicCode = generatePublicCode();
  }

  const now = new Date().toISOString();

  // Create event with status OPEN by default so it's immediately usable
  db.prepare(
    `
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
  `
  ).run({
    $public_code: publicCode,
    $title: title,
    $location_name: locationName,
    $latitude: lat,
    $longitude: lon,
    $radius_meters: radiusMeters,
    $starts_at: startsAt || null,
    $ends_at: endsAt || null,
    $created_by_user_id: user.id,
    $opened_at: now,
    $created_at: now,
  });

  return c.redirect(`/admin?notice=Evento+«${encodeURIComponent(title)}»+creado+exitosamente`);
});

// 4. Toggle Event Status (Open <-> Closed) (Admin only)
adminEventsRoute.post("/events/:id/toggle", requireAdmin, (c) => {
  const id = Number(c.req.param("id"));
  const db = getDatabase();

  const event = db
    .prepare("SELECT id, status, title FROM events WHERE id = $id")
    .get({ $id: id }) as { id: number; status: string; title: string } | null;

  if (!event) {
    return c.redirect("/admin?notice=Evento+no+encontrado");
  }

  const now = new Date().toISOString();
  let newStatus = "OPEN";
  let openedAt: string | null = now;
  let closedAt: string | null = null;

  if (event.status === "OPEN") {
    newStatus = "CLOSED";
    openedAt = null;
    closedAt = now;
  }

  db.prepare(
    `
    UPDATE events
    SET 
      status = $status,
      opened_at = COALESCE($opened_at, opened_at),
      closed_at = COALESCE($closed_at, closed_at)
    WHERE id = $id
  `
  ).run({
    $status: newStatus,
    $opened_at: openedAt,
    $closed_at: closedAt,
    $id: id,
  });

  const statusLabel = newStatus === "OPEN" ? "abierta" : "cerrada";
  return c.redirect(
    `/admin?notice=Asistencia+para+«${encodeURIComponent(event.title)}»+ahora+está+${statusLabel}`
  );
});
