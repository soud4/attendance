import type { AttendanceWithEvent } from "../../services/attendance.service";

interface AttendancesViewProps {
  attendances: AttendanceWithEvent[];
  nextCursor?: number | null;
  currentCursor?: number;
  limit?: number;
  totalCount?: number;
}

export function AttendancesView({
  attendances,
  nextCursor,
  currentCursor,
  limit,
  totalCount,
}: AttendancesViewProps) {
  const displayedCount = attendances.length;
  const overallCount = totalCount ?? displayedCount;

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
            {overallCount}
          </span>
        </div>
      </div>

      {/* Attendances Container: Mobile Compressed Cards + Desktop Full Table */}
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
          <div>
            {/* Mobile View: Compressed Cards (block md:hidden) */}
            <div class="block md:hidden divide-y divide-neutral-800/60">
              {attendances.map((att) => (
                <div class="attendance-row p-3.5 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="attendee-dni font-mono font-bold text-white text-xs tracking-wider">
                        {att.dni}
                      </span>
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                        {att.method === "ASSISTED" ? "Asistido" : "Autoservicio"}
                      </span>
                    </div>
                    <a
                      href={`/admin/events/${att.event_id}`}
                      class="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      <span>Ver Evento</span>
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>

                  {att.attendee_name && (
                    <div class="text-xs font-semibold text-white">
                      {att.attendee_name}
                      {att.attendee_base && <span class="text-neutral-400 font-normal ml-1">({att.attendee_base})</span>}
                    </div>
                  )}

                  <div class="attendee-event text-xs font-semibold text-neutral-200">
                    <div>{att.event_title}</div>
                    <div class="text-[10px] font-mono text-neutral-500 font-normal">{att.event_public_code}</div>
                  </div>

                  <div class="flex flex-col gap-1 text-[11px] font-mono text-neutral-400 pt-1 border-t border-neutral-800/40">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5">
                        <span class="text-neutral-500">Entrada:</span>
                        <span class="text-neutral-200">
                          {new Date(att.created_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-neutral-500">Salida:</span>
                        {att.check_out_at ? (
                          <span class="text-emerald-400 font-semibold">
                            {new Date(att.check_out_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        ) : (
                          <span class="px-1.5 py-0.5 rounded text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800/40 font-semibold">
                            En curso
                          </span>
                        )}
                      </div>
                    </div>
                    <div class="flex items-center justify-between text-[10px] text-neutral-500 pt-0.5">
                      <span>{att.distance_meters}m &bull; &plusmn;{Math.round(att.accuracy_meters)}m GPS</span>
                      <span>
                        {new Date(att.created_at).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Full Table (hidden md:block) */}
            <div class="hidden md:block overflow-x-auto">
              <table id="attendancesTable" class="w-full text-left text-xs text-neutral-300">
                <thead class="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th scope="col" class="py-3 px-4">DNI</th>
                    <th scope="col" class="py-3 px-4">Asistente</th>
                    <th scope="col" class="py-3 px-4">Evento</th>
                    <th scope="col" class="py-3 px-4">Entrada</th>
                    <th scope="col" class="py-3 px-4">Salida</th>
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

                      <td class="py-3 px-4 text-xs">
                        <div class="font-semibold text-white">{att.attendee_name || "-"}</div>
                        {att.attendee_base && <div class="text-[10px] text-neutral-400 font-mono">{att.attendee_base}</div>}
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
                        })}
                      </td>

                      <td class="py-3 px-4 font-mono text-xs whitespace-nowrap">
                        {att.check_out_at ? (
                          <span class="text-emerald-400 font-semibold">
                            {new Date(att.check_out_at).toLocaleString("es-PE", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        ) : (
                          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/40">
                            En curso
                          </span>
                        )}
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

            {/* Pagination Controls Footer */}
            {(nextCursor != null || currentCursor != null) && (
              <div class="p-3.5 sm:p-4 border-t border-neutral-800/80 bg-neutral-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
                <div class="flex items-center gap-1.5 font-mono text-center sm:text-left">
                  <span>Mostrando</span>
                  <span class="font-semibold text-white">{displayedCount}</span>
                  <span>registros en esta página</span>
                  {totalCount != null && (
                    <span>(total: <strong class="text-neutral-200">{totalCount}</strong>)</span>
                  )}
                </div>

                <div class="flex items-center gap-2">
                  {currentCursor ? (
                    <a
                      href="/admin/attendances"
                      class="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 text-white font-medium text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Primera Página</span>
                    </a>
                  ) : null}

                  {nextCursor ? (
                    <a
                      href={`/admin/attendances?cursor=${nextCursor}${limit ? `&limit=${limit}` : ""}`}
                      class="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 text-white font-medium text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Siguiente Página</span>
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  ) : (
                    <span class="text-neutral-500 text-[11px] font-mono px-2 py-1">Fin de los registros</span>
                  )}
                </div>
              </div>
            )}
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
