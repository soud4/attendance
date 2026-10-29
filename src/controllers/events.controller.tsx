import type { Context } from "hono";
import { EventService } from "../services/event.service";
import { type UserSession } from "../utils/auth";
import { AdminLayout } from "../views/layouts/admin_layout";
import { DashboardView } from "../views/admin/dashboard_view";
import { EventFormView } from "../views/admin/event_form_view";
import { EventEditView } from "../views/admin/event_edit_view";
import { EventDetailView } from "../views/admin/event_detail_view";
import { AppError } from "../services/errors";

export class EventsController {
  /**
   * GET /admin - Display dashboard with all events & metrics (cards or table view)
   */
  public static index(c: Context) {
    const user = c.get("user") as UserSession;
    const notice = c.req.query("notice");
    const viewParam = c.req.query("view");
    const currentView = viewParam === "table" ? "table" : "cards";
    const events = EventService.getAllWithStats();

    return c.html(
      <AdminLayout title="Dashboard de Eventos" user={user} activePath="/admin">
        <DashboardView events={events} noticeMessage={notice} currentView={currentView} />
      </AdminLayout>
    );
  }

  /**
   * GET /admin/events/new - Render event creation form
   */
  public static renderCreate(c: Context) {
    const user = c.get("user") as UserSession;
    return c.html(
      <AdminLayout title="Nuevo Evento" user={user} activePath="/admin">
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
    let startsAt = String(body.starts_at || "").trim();
    let endsAt = String(body.ends_at || "").trim();
    const eventDate = String(body.event_date || "").trim();
    const startTime = String(body.start_time || "").trim();
    const endTime = String(body.end_time || "").trim();

    if (!startsAt && eventDate && startTime) {
      startsAt = `${eventDate}T${startTime}`;
    } else if (!startsAt && (startTime || eventDate)) {
      startsAt = startTime || eventDate;
    }

    if (!endsAt && eventDate && endTime) {
      endsAt = `${eventDate}T${endTime}`;
    } else if (!endsAt && (endTime || eventDate)) {
      endsAt = endTime || eventDate;
    }

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
        <AdminLayout title="Nuevo Evento" user={user} activePath="/admin">
          <EventFormView errorMessage={message} values={body} />
        </AdminLayout>,
        statusCode as any
      );
    }
  }

  /**
   * GET /admin/events/:id - Show event details & attendees
   */
  public static show(c: Context) {
    const user = c.get("user") as UserSession;
    const id = Number(c.req.param("id"));

    try {
      const { event, attendances } = EventService.getWithAttendances(id);
      return c.html(
        <AdminLayout title={event.title} user={user} activePath="/admin">
          <EventDetailView event={event} attendances={attendances} />
        </AdminLayout>
      );
    } catch {
      return c.redirect("/admin?notice=Evento+no+encontrado");
    }
  }

  /**
   * GET /admin/events/:id/edit - Render event edit form
   */
  public static renderEdit(c: Context) {
    const user = c.get("user") as UserSession;
    const id = Number(c.req.param("id"));

    const event = EventService.getById(id);
    if (!event) {
      return c.redirect("/admin?notice=Evento+no+encontrado");
    }

    return c.html(
      <AdminLayout title={`Editar ${event.title}`} user={user} activePath="/admin">
        <EventEditView event={event} />
      </AdminLayout>
    );
  }

  /**
   * POST /admin/events/:id/edit - Update existing event
   */
  public static async update(c: Context) {
    const user = c.get("user") as UserSession;
    const id = Number(c.req.param("id"));
    const body = await c.req.parseBody();

    const title = String(body.title || "").trim();
    const locationName = String(body.location_name || "").trim();
    const latStr = String(body.latitude || "").trim();
    const lonStr = String(body.longitude || "").trim();
    const radiusMeters = Number(body.radius_meters) || 100;
    let startsAt = String(body.starts_at || "").trim();
    let endsAt = String(body.ends_at || "").trim();
    const eventDate = String(body.event_date || "").trim();
    const startTime = String(body.start_time || "").trim();
    const endTime = String(body.end_time || "").trim();

    if (!startsAt && eventDate && startTime) {
      startsAt = `${eventDate}T${startTime}`;
    } else if (!startsAt && (startTime || eventDate)) {
      startsAt = startTime || eventDate;
    }

    if (!endsAt && eventDate && endTime) {
      endsAt = `${eventDate}T${endTime}`;
    } else if (!endsAt && (endTime || eventDate)) {
      endsAt = endTime || eventDate;
    }
    const status = String(body.status || "OPEN") as "OPEN" | "CLOSED";

    try {
      const updated = EventService.update(id, {
        title,
        location_name: locationName,
        latitude: parseFloat(latStr),
        longitude: parseFloat(lonStr),
        radius_meters: radiusMeters,
        starts_at: startsAt || null,
        ends_at: endsAt || null,
        status,
      });

      return c.redirect(
        `/admin/events/${updated.id}?notice=Evento+actualizado+exitosamente`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar el evento.";
      const statusCode = err instanceof AppError ? err.statusCode : 400;
      const event = EventService.getById(id);
      if (!event) {
        return c.redirect("/admin?notice=Evento+no+encontrado");
      }

      return c.html(
        <AdminLayout title={`Editar ${event.title}`} user={user} activePath="/admin">
          <EventEditView event={{ ...event, title, location_name: locationName }} errorMessage={message} />
        </AdminLayout>,
        statusCode as any
      );
    }
  }

  /**
   * POST /admin/events/:id/delete - Delete event and its attendances
   */
  public static delete(c: Context) {
    const id = Number(c.req.param("id"));

    try {
      EventService.delete(id);
      return c.redirect("/admin?notice=Evento+eliminado+exitosamente");
    } catch {
      return c.redirect("/admin?notice=Error+al+eliminar+el+evento");
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
