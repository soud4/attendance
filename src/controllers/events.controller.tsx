import type { Context } from "hono";
import { EventService } from "../services/event.service";
import { type UserSession } from "../utils/auth";
import { AdminLayout } from "../views/layouts/admin_layout";
import { DashboardView } from "../views/admin/dashboard_view";
import { EventFormView } from "../views/admin/event_form_view";
import { AppError } from "../services/errors";

export class EventsController {
  /**
   * GET /admin - Display dashboard with all events & metrics
   */
  public static index(c: Context) {
    const user = c.get("user") as UserSession;
    const notice = c.req.query("notice");
    const events = EventService.getAllWithStats();

    return c.html(
      <AdminLayout title="Dashboard de Eventos" user={user}>
        <DashboardView events={events} noticeMessage={notice} />
      </AdminLayout>
    );
  }

  /**
   * GET /admin/events/new - Render event creation form
   */
  public static renderCreate(c: Context) {
    const user = c.get("user") as UserSession;
    return c.html(
      <AdminLayout title="Nuevo Evento" user={user}>
        <EventFormView />
      </AdminLayout>
    );
  }

  /**
   * POST /admin/events - Create new event (Admin only)
   */
  public static async create(c: Context) {
    const user = c.get("user") as UserSession;
    const body = await c.req.parseBody();

    const title = String(body.title || "").trim();
    const locationName = String(body.location_name || "").trim();
    const latStr = String(body.latitude || "").trim();
    const lonStr = String(body.longitude || "").trim();
    const radiusMeters = Number(body.radius_meters) || 100;
    const startsAt = String(body.starts_at || "").trim();
    const endsAt = String(body.ends_at || "").trim();

    try {
      const createdEvent = EventService.create({
        title,
        location_name: locationName,
        latitude: parseFloat(latStr),
        longitude: parseFloat(lonStr),
        radius_meters: radiusMeters,
        starts_at: startsAt || null,
        ends_at: endsAt || null,
        created_by_user_id: user.id,
      });

      return c.redirect(
        `/admin?notice=Evento+«${encodeURIComponent(createdEvent.title)}»+creado+exitosamente`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear el evento.";
      const statusCode = err instanceof AppError ? err.statusCode : 400;
      return c.html(
        <AdminLayout title="Nuevo Evento" user={user}>
          <EventFormView errorMessage={message} values={body} />
        </AdminLayout>,
        statusCode as any
      );
    }
  }

  /**
   * POST /admin/events/:id/toggle - Toggle event status between OPEN and CLOSED
   */
  public static toggle(c: Context) {
    const id = Number(c.req.param("id"));

    try {
      const { event, newStatus } = EventService.toggleStatus(id);
      const statusLabel = newStatus === "OPEN" ? "abierta" : "cerrada";
      return c.redirect(
        `/admin?notice=Asistencia+para+«${encodeURIComponent(event.title)}»+ahora+está+${statusLabel}`
      );
    } catch {
      return c.redirect("/admin?notice=Evento+no+encontrado");
    }
  }
}
