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
      <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-sm">
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div class="relative flex-1">
            <svg class="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              id="attendanceFilterInput"
              placeholder="Buscar por DNI, asistente o evento..."
              oninput="filterAndSortAttendances()"
              onkeyup="filterAndSortAttendances()"
              class="w-full bg-neutral-800/90 border border-neutral-700/80 rounded-xl text-white text-xs pl-10 pr-4 py-2.5 placeholder:text-neutral-500 focus:border-blue-500/80 focus:outline-none"
            />
          </div>

          <div class="flex items-center gap-2">
            {/* Date Filter */}
            <div class="relative flex items-center">
              <input
                type="date"
                id="attendanceDateFilter"
                onchange="filterAndSortAttendances()"
                title="Filtrar por fecha de marcación"
                class="bg-neutral-800/90 border border-neutral-700/80 rounded-xl text-neutral-300 text-xs px-2.5 py-2 focus:border-blue-500/80 focus:outline-none"
              />
              <button
                type="button"
                id="attendanceDateClearBtn"
                onclick="clearAttendanceDateFilter()"
                title="Limpiar fecha"
                class="hidden ml-1 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Order Switcher Toggle */}
            <button
              type="button"
              id="attendanceOrderToggleBtn"
              onclick="toggleAttendanceOrder()"
              class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 text-white text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
              title="Cambiar orden por fecha de registro"
            >
              <svg id="attendanceOrderIcon" class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span id="attendanceOrderLabel">Recientes</span>
            </button>
          </div>
        </div>

        {/* Dynamic Count Indicator */}
        <div class="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-2 border-t border-neutral-800/70">
          <div>
            Mostrando <strong id="attendanceVisibleCount" class="text-white">{displayedCount}</strong> de {overallCount} marcaciones
          </div>
          {nextCursor != null && (
            <span class="text-neutral-500 text-[10px]">Paginación activa</span>
          )}
        </div>
      </div>

      {/* Empty Filter Results Message */}
      <div id="attendanceEmptyFilterMessage" class="hidden p-10 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
        <div class="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto mb-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p class="text-xs font-semibold text-white">No se encontraron asistencias</p>
        <p class="text-[11px] text-neutral-400 mt-1">Ninguna marcación coincide con los filtros aplicados.</p>
        <button
          type="button"
          onclick="resetAttendanceFilters()"
          class="mt-3 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
        >
          Limpiar filtros
        </button>
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
            <div class="block md:hidden divide-y divide-neutral-800/60" id="attendanceMobileContainer">
              {attendances.map((att) => {
                const dateIso = att.created_at ? att.created_at.slice(0, 10) : "";
                const timestamp = new Date(att.created_at).getTime();

                return (
                  <div
                    class="attendance-row p-3.5 space-y-2"
                    data-id={att.id}
                    data-dni={att.dni.toLowerCase()}
                    data-name={(att.attendee_name || "").toLowerCase()}
                    data-event={(att.event_title || "").toLowerCase()}
                    data-code={(att.event_public_code || "").toLowerCase()}
                    data-date={dateIso}
                    data-timestamp={timestamp}
                  >
                    {/* Level 1: DNI, Method badge, and Event link */}
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="attendee-dni font-mono font-bold text-white text-xs tracking-wider">
                          {att.dni}
                        </span>
                        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                          {att.method === "ASSISTED" ? (
                            <>
                              <svg class="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>Asistido</span>
                            </>
                          ) : (
                            <>
                              <svg class="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                              <span>Autoservicio</span>
                            </>
                          )}
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

                    {/* Level 2: Attendee Name (if present) & Base, Event Title */}
                    {att.attendee_name && (
                      <div class="flex items-center gap-1.5 text-xs font-semibold text-white">
                        <svg class="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span class="truncate">{att.attendee_name}</span>
                        {att.attendee_base && (
                          <span class="px-1.5 py-0.2 rounded text-[10px] bg-neutral-800 text-neutral-400 font-normal font-mono border border-neutral-700/50">
                            {att.attendee_base}
                          </span>
                        )}
                      </div>
                    )}

                    <div class="attendee-event text-xs font-semibold text-neutral-200">
                      <div>{att.event_title}</div>
                      <div class="text-[10px] font-mono text-neutral-500 font-normal">{att.event_public_code}</div>
                    </div>

                    {/* Level 3: Compact Timestamps & GPS Info with clean SVG icons */}
                    <div class="flex flex-col gap-1 text-[11px] font-mono text-neutral-400 pt-1.5 border-t border-neutral-800/40">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-1.5">
                          <svg class="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          <span class="text-neutral-500">Entrada:</span>
                          <span class="text-neutral-200">
                            {new Date(att.created_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div class="flex items-center gap-1.5">
                          <svg class="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
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
                        <span class="flex items-center gap-1">
                          <svg class="w-3 h-3 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{att.distance_meters}m &bull; &plusmn;{Math.round(att.accuracy_meters)}m GPS</span>
                        </span>
                        <span class="flex items-center gap-1">
                          <svg class="w-3 h-3 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {new Date(att.created_at).toLocaleDateString("es-PE", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                <tbody class="divide-y divide-neutral-800/60" id="attendancesTableBody">
                  {attendances.map((att) => {
                    const dateIso = att.created_at ? att.created_at.slice(0, 10) : "";
                    const timestamp = new Date(att.created_at).getTime();

                    return (
                      <tr
                        class="attendance-row hover:bg-neutral-800/30 transition-colors"
                        data-id={att.id}
                        data-dni={att.dni.toLowerCase()}
                        data-name={(att.attendee_name || "").toLowerCase()}
                        data-event={(att.event_title || "").toLowerCase()}
                        data-code={(att.event_public_code || "").toLowerCase()}
                        data-date={dateIso}
                        data-timestamp={timestamp}
                      >
                        <td class="py-3 px-4 font-mono font-bold text-white text-xs tracking-wider attendee-dni">
                          {att.dni}
                        </td>

                        <td class="py-3 px-4 text-xs">
                          <div class="font-semibold text-white">{att.attendee_name || "-"}</div>
                          {att.attendee_base && <div class="text-[10px] text-neutral-400 font-mono">{att.attendee_base}</div>}
                        </td>

                        <td class="py-3 px-4 font-medium text-white attendee-event max-w-xs truncate">
                          <div>{att.event_title}</div>
                          <div class="font-mono text-[10px] text-neutral-500">{att.event_public_code}</div>
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
                    );
                  })}
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
          let activeAttendanceOrder = "DESC";

          function toggleAttendanceOrder() {
            activeAttendanceOrder = activeAttendanceOrder === "DESC" ? "ASC" : "DESC";
            const label = document.getElementById("attendanceOrderLabel");
            if (label) label.textContent = activeAttendanceOrder === "DESC" ? "Recientes" : "Antiguos";
            filterAndSortAttendances();
          }

          function clearAttendanceDateFilter() {
            const dateInput = document.getElementById("attendanceDateFilter");
            if (dateInput) dateInput.value = "";
            const clearBtn = document.getElementById("attendanceDateClearBtn");
            if (clearBtn) clearBtn.classList.add("hidden");
            filterAndSortAttendances();
          }

          function resetAttendanceFilters() {
            const input = document.getElementById("attendanceFilterInput");
            if (input) input.value = "";
            clearAttendanceDateFilter();
          }

          function filterAndSortAttendances() {
            const input = document.getElementById("attendanceFilterInput");
            const filter = (input ? input.value : "").toLowerCase().trim();

            const dateInput = document.getElementById("attendanceDateFilter");
            const selectedDate = dateInput ? dateInput.value : "";

            const clearBtn = document.getElementById("attendanceDateClearBtn");
            if (clearBtn) {
              if (selectedDate) clearBtn.classList.remove("hidden");
              else clearBtn.classList.add("hidden");
            }

            // Sort mobile cards and desktop table rows
            const mobileContainer = document.getElementById("attendanceMobileContainer");
            const tableBody = document.getElementById("attendancesTableBody");

            function sortContainer(container) {
              if (!container) return;
              const rows = Array.from(container.children).filter(el => el.classList.contains("attendance-row"));
              rows.sort((a, b) => {
                const tsA = parseInt(a.getAttribute("data-timestamp") || "0", 10);
                const tsB = parseInt(b.getAttribute("data-timestamp") || "0", 10);
                return activeAttendanceOrder === "DESC" ? tsB - tsA : tsA - tsB;
              });
              rows.forEach(r => container.appendChild(r));
            }

            sortContainer(mobileContainer);
            sortContainer(tableBody);

            // Filter rows
            const allRows = document.querySelectorAll(".attendance-row");
            allRows.forEach(row => {
              const dni = row.getAttribute("data-dni") || "";
              const name = row.getAttribute("data-name") || "";
              const eventTitle = row.getAttribute("data-event") || "";
              const code = row.getAttribute("data-code") || "";
              const rowDate = row.getAttribute("data-date") || "";

              const matchesSearch = !filter || dni.includes(filter) || name.includes(filter) || eventTitle.includes(filter) || code.includes(filter);
              const matchesDate = !selectedDate || rowDate === selectedDate || rowDate.startsWith(selectedDate);

              if (matchesSearch && matchesDate) {
                row.style.display = "";
              } else {
                row.style.display = "none";
              }
            });

            // Visible count
            const isDesktop = window.innerWidth >= 768;
            const visibleCount = isDesktop
              ? (tableBody ? tableBody.querySelectorAll(".attendance-row:not([style*='display: none'])").length : 0)
              : (mobileContainer ? mobileContainer.querySelectorAll(".attendance-row:not([style*='display: none'])").length : 0);

            const countEl = document.getElementById("attendanceVisibleCount");
            if (countEl) countEl.textContent = visibleCount;

            const emptyMsg = document.getElementById("attendanceEmptyFilterMessage");
            if (emptyMsg) {
              if (visibleCount === 0) emptyMsg.classList.remove("hidden");
              else emptyMsg.classList.add("hidden");
            }
          }

          // Backwards-compatible alias
          function filterAttendanceTable() {
            filterAndSortAttendances();
          }
        `,
        }}
      />
    </div>
  );
}
