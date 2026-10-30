import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { AttendanceService } from "../services/attendance.service";
import { AttendeeService } from "../services/attendee.service";
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
  ValidationError,
} from "../services/errors";

export class AttendanceController {
  /**
   * GET /asistir/lookup/:dni - Query directory (padrón) to check if attendee is already registered
   */
  public static lookupDni(c: Context) {
    const dni = String(c.req.param("dni") || "").trim();
    if (!/^\d{8}$/.test(dni)) {
      return c.json(
        {
          success: false,
          error: "El DNI debe contener exactamente 8 dígitos numéricos.",
        },
        400
      );
    }

    const attendee = AttendeeService.findByDni(dni);
    if (attendee) {
      return c.json({
        success: true,
        registered: true,
        dni: attendee.dni,
        full_name: attendee.full_name,
        base_name: attendee.base_name,
      });
    }

    return c.json({
      success: true,
      registered: false,
      dni,
    });
  }

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

    // Check if attendee already marked check-in via cookie
    const cookieDni = getCookie(c, `att_${code}`);
    let initialAttendance = null;
    if (cookieDni && /^\d{8}$/.test(cookieDni)) {
      initialAttendance = AttendanceService.getByEventAndDni(event.id, cookieDni);
    }

    return c.html(<AttendanceView event={event} initialAttendance={initialAttendance} />);
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

    const { dni, latitude, longitude, accuracy, full_name, base_name } = body;
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
        fullName: full_name,
        baseName: base_name,
        ipAddress,
        userAgent,
      });

      // If check-in was registered, persist cookie for seamless departure checkout
      if (result.action === "CHECK_IN") {
        setCookie(c, `att_${code}`, result.dni, {
          path: "/",
          maxAge: 86400 * 2, // 48 hours
          sameSite: "Lax",
        });
      }

      return c.json({
        success: true,
        action: result.action,
        message:
          result.action === "CHECK_IN"
            ? "Entrada registrada correctamente"
            : "Salida registrada correctamente",
        details: {
          attendance_id: result.attendanceId,
          dni: result.dni,
          full_name: result.fullName,
          base_name: result.baseName,
          action: result.action,
          distance_meters: result.distanceMeters,
          recorded_at: result.recordedAt,
          check_in_at: result.checkInAt || result.recordedAt,
          check_out_at: result.checkOutAt || (result.action === "CHECK_OUT" ? result.recordedAt : null),
          event_title: result.event.title,
        },
      });
    } catch (err) {
      if (err instanceof InvalidDniError) {
        return c.json({ success: false, title: "DNI no válido", error: err.message }, 400);
      }
      if (err instanceof ValidationError) {
        return c.json({ success: false, title: "Dato requerido", error: err.message }, 400);
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
