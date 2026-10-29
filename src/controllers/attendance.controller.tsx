import type { Context } from "hono";
import { AttendanceService } from "../services/attendance.service";
import { EventService, isEventExpired } from "../services/event.service";
import { AttendanceView } from "../views/asistencia";
import { renderNotFoundView } from "../views/errors/error_view";
import {
  EventNotFoundError,
  EventClosedError,
  OutOfRadiusError,
  AttendanceAlreadyRegisteredError,
  InvalidDniError,
  InvalidCoordinatesError,
} from "../services/errors";

export class AttendanceController {
  /**
   * GET /asistir/:code - Render public attendance view for the event
   */
  public static renderForm(c: Context) {
    const code = String(c.req.param("code") || "");
    const event = EventService.getByPublicCode(code);

    if (!event) {
      return c.html(
        renderNotFoundView({
          title: "Evento no encontrado",
          message: "El código o enlace de evento no existe o ya ha expirado.",
          backUrl: "/",
        }),
        404
      );
    }

    return c.html(<AttendanceView event={event} />);
  }

  /**
   * GET /asistir/:code/status - Get current event status in JSON
   */
  public static status(c: Context) {
    const code = String(c.req.param("code") || "");
    const event = EventService.getByPublicCode(code);

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

    const expired = isEventExpired(event);
    const isOpen = event.status === "OPEN" && !expired;

    return c.json({
      success: true,
      status: event.status,
      is_open: isOpen,
      is_expired: expired,
      title: event.title,
      location_name: event.location_name,
      starts_at: event.starts_at,
      ends_at: event.ends_at,
    });
  }

  /**
   * POST /asistir/:code - Process attendance registration with GPS verification
   */
  public static async register(c: Context) {
    const code = String(c.req.param("code") || "");

    let body: any;
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
    const ipAddress =
      c.req.header("x-forwarded-for") || c.req.header("cf-connecting-ip") || "127.0.0.1";
    const userAgent = c.req.header("user-agent") || "Unknown";

    try {
      const result = AttendanceService.register({
        eventPublicCode: code,
        dni,
        latitude,
        longitude,
        accuracy,
        ipAddress,
        userAgent,
      });

      return c.json({
        success: true,
        message: "Asistencia registrada correctamente",
        details: {
          attendance_id: result.attendanceId,
          dni: result.dni,
          distance_meters: result.distanceMeters,
          recorded_at: result.recordedAt,
          event_title: result.event.title,
        },
      });
    } catch (err) {
      if (err instanceof InvalidDniError) {
        return c.json({ success: false, title: "DNI no válido", error: err.message }, 400);
      }
      if (err instanceof InvalidCoordinatesError) {
        return c.json({ success: false, title: "Ubicación inválida", error: err.message }, 400);
      }
      if (err instanceof EventNotFoundError) {
        return c.json({ success: false, title: "Evento no encontrado", error: err.message }, 404);
      }
      if (err instanceof EventClosedError) {
        return c.json({ success: false, title: "El registro ha finalizado", error: err.message }, 400);
      }
      if (err instanceof OutOfRadiusError) {
        return c.json(
          {
            success: false,
            title: "Fuera de la zona del evento",
            error: err.message,
            details: {
              distance_meters: err.distanceMeters,
              allowed_radius_meters: err.allowedRadius,
            },
          },
          400
        );
      }
      if (err instanceof AttendanceAlreadyRegisteredError) {
        return c.json(
          {
            success: false,
            title: "Asistencia ya registrada",
            error: err.message,
          },
          409
        );
      }

      console.error("Error al registrar asistencia:", err);
      return c.json(
        {
          success: false,
          title: "Error de registro",
          error: "Ocurrió un error interno al registrar la asistencia.",
        },
        500
      );
    }
  }
}
