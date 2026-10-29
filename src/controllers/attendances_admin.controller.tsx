import type { Context } from "hono";
import { AttendanceService } from "../services/attendance.service";
import { type UserSession } from "../utils/auth";
import { AdminLayout } from "../views/layouts/admin_layout";
import { AttendancesView } from "../views/admin/attendances_view";

export class AttendancesAdminController {
  /**
   * GET /admin/attendances - Centralized real-time attendances list
   */
  public static index(c: Context) {
    const user = c.get("user") as UserSession;
    const attendances = AttendanceService.getAllWithEventInfo();

    return c.html(
      <AdminLayout title="Registro Global de Asistencias" user={user} activePath="/admin/attendances">
        <AttendancesView attendances={attendances} />
      </AdminLayout>
    );
  }

  /**
   * GET /admin/attendances/export - Export all attendances to CSV format
   */
  public static exportCsv(c: Context) {
    const attendances = AttendanceService.getAllWithEventInfo();

    // CSV Headers
    const headers = [
      "ID",
      "DNI",
      "Evento",
      "Codigo_Evento",
      "Fecha_Hora",
      "Distancia_Metros",
      "Precision_Metros",
      "Metodo",
      "Direccion_IP",
    ];

    const escapeCsv = (val: string | number | null | undefined): string => {
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = attendances.map((a) => [
      escapeCsv(a.id),
      escapeCsv(a.dni),
      escapeCsv(a.event_title),
      escapeCsv(a.event_public_code),
      escapeCsv(a.created_at),
      escapeCsv(a.distance_meters),
      escapeCsv(a.accuracy_meters),
      escapeCsv(a.method),
      escapeCsv(a.ip_address),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="asistencias-${timestamp}.csv"`,
      },
    });
  }
}
