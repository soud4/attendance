import type { AttendanceWithEvent } from "../../services/attendance.service";

interface AttendancesViewProps {
  attendances: AttendanceWithEvent[];
}

export function AttendancesView({ attendances }: AttendancesViewProps) {
  const totalAttendances = attendances.length;

  return (
    <div class="space-y-6">
      {/* Top Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white">Registro Global de Asistencias</h1>
          <p class="text-xs text-neutral-400 mt-1">
            Supervisa en tiempo real las marcaciones georreferenciadas registradas en todos los eventos
          </p>
        </div>

        <div class="flex items-center gap-3">
          {/* CSV Export Button */}
          <a
            href="/admin/attendances/export"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exportar CSV</span>
          </a>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div class="relative w-full sm:w-80">
          <svg class="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            id="attendanceFilterInput"
            placeholder="Buscar por DNI o Evento..."
            onkeyup="filterAttendanceTable()"
            class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-xs pl-10 pr-4 py-2.5 placeholder:text-neutral-500 focus:border-blue-500/80 focus:outline-none"
          />
        </div>

        <div class="text-xs text-neutral-400 font-mono flex items-center gap-2">
          <span>Total de marcaciones:</span>
          <span class="font-bold text-white bg-neutral-800 px-2 py-0.5 rounded-lg border border-neutral-700/60">
            {totalAttendances}
          </span>
        </div>
      </div>

      {/* Attendances Table */}
      <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-sm">
        {attendances.length === 0 ? (
          <div class="p-12 text-center text-xs text-neutral-500">
            <svg class="w-10 h-10 text-neutral-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p class="font-semibold text-neutral-400">Sin asistencias registradas</p>
            <p class="text-neutral-500 mt-1">Aún no se han recibido registros en el sistema.</p>
          </div>
        ) : (
          <div class="overflow-x-auto">
            <table id="attendancesTable" class="w-full text-left text-xs text-neutral-300">
              <thead class="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th scope="col" class="py-3 px-4">DNI</th>
                  <th scope="col" class="py-3 px-4">Evento</th>
                  <th scope="col" class="py-3 px-4">Fecha y Hora</th>
                  <th scope="col" class="py-3 px-4">Distancia</th>
                  <th scope="col" class="py-3 px-4">Precisión GPS</th>
                  <th scope="col" class="py-3 px-4">Método</th>
                  <th scope="col" class="py-3 px-4 text-right">Detalle Evento</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-800/60">
                {attendances.map((att) => (
                  <tr class="attendance-row hover:bg-neutral-800/30 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-white text-xs tracking-wider attendee-dni">
                      {att.dni}
                    </td>

                    <td class="py-3 px-4 font-medium text-white attendee-event max-w-xs truncate">
                      <div>{att.event_title}</div>
                      <div class="text-[10px] font-mono text-neutral-500">{att.event_public_code}</div>
                    </td>

                    <td class="py-3 px-4 font-mono text-neutral-300 text-xs whitespace-nowrap">
                      {new Date(att.created_at).toLocaleString("es-PE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    <td class="py-3 px-4 font-mono text-xs whitespace-nowrap">
                      <span class="text-emerald-400 font-semibold">{att.distance_meters}m</span>
                    </td>

                    <td class="py-3 px-4 font-mono text-neutral-400 text-xs whitespace-nowrap">
                      &plusmn;{Math.round(att.accuracy_meters)}m
                    </td>

                    <td class="py-3 px-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                        {att.method === "ASSISTED" ? "Asistido" : "Autoservicio"}
                      </span>
                    </td>

                    <td class="py-3 px-4 text-right whitespace-nowrap">
                      <a
                        href={`/admin/events/${att.event_id}`}
                        class="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
                      >
                        <span>Ver</span>
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          function filterAttendanceTable() {
            const input = document.getElementById("attendanceFilterInput");
            const filter = input.value.toLowerCase().trim();
            const rows = document.querySelectorAll(".attendance-row");

            rows.forEach((row) => {
              const dni = row.querySelector(".attendee-dni")?.textContent.toLowerCase() || "";
              const eventName = row.querySelector(".attendee-event")?.textContent.toLowerCase() || "";
              if (dni.includes(filter) || eventName.includes(filter)) {
                row.style.display = "";
              } else {
                row.style.display = "none";
              }
            });
          }
        `,
        }}
      />
    </div>
  );
}
