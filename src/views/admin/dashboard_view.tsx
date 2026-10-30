import type { EventWithStats } from "../../services/event.service";

interface DashboardViewProps {
  events: EventWithStats[];
  noticeMessage?: string;
  currentView?: "cards" | "table";
}

export function DashboardView({ events, noticeMessage, currentView = "cards" }: DashboardViewProps) {
  const totalEvents = events.length;
  const openEvents = events.filter((e) => e.status === "OPEN").length;
  const totalAttendances = events.reduce((sum, e) => sum + e.attendee_count, 0);

  return (
    <div class="space-y-6">
      {/* Top Action Bar */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white">Eventos Registrados</h1>
          <p class="text-xs text-neutral-400 mt-1">Supervisa, administra y controla la asistencia de tus actividades presenciales</p>
        </div>

        <div class="flex items-center gap-3">
          {/* View Switcher Toggle */}
          <div class="bg-neutral-900 border border-neutral-800 p-1 rounded-xl flex items-center gap-1 shadow-sm">
            <a
              href="/admin?view=cards"
              title="Vista de Tarjetas"
              class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === "cards"
                  ? "bg-neutral-800 text-white shadow-sm border border-neutral-700/60"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Tarjetas</span>
            </a>

            <a
              href="/admin?view=table"
              title="Vista de Tabla"
              class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === "table"
                  ? "bg-neutral-800 text-white shadow-sm border border-neutral-700/60"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Tabla</span>
            </a>
          </div>

          {/* New Event Buttons */}
          <button
            type="button"
            id="openQuickCreateModalBtn"
            onclick="openQuickCreateModal()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Nuevo Evento</span>
          </button>
        </div>
      </div>

      {/* Notice / Alert Banner */}
      {noticeMessage && (
        <div class="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{noticeMessage}</span>
          </div>
        </div>
      )}

      {/* Stat Summary Cards - 2 per line on mobile, 3 on desktop, compact padding */}
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Total Eventos */}
        <div class="p-3 sm:p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex items-center gap-3">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div class="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Total Eventos</div>
            <div class="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">{totalEvents}</div>
          </div>
        </div>

        {/* Eventos Abiertos */}
        <div class="p-3 sm:p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex items-center gap-3">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-950/50 text-emerald-400 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div class="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">En Curso</div>
            <div class="text-lg sm:text-xl font-bold text-emerald-400 font-mono mt-0.5">{openEvents}</div>
          </div>
        </div>

        {/* Total Asistencias */}
        <div class="col-span-2 md:col-span-1 p-3 sm:p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex items-center gap-3">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-950/50 text-blue-400 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div class="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Asistencias</div>
            <div class="text-lg sm:text-xl font-bold text-blue-400 font-mono mt-0.5">{totalAttendances}</div>
          </div>
        </div>
      </div>

      {/* Main Content: Cards or Table */}
      {events.length === 0 ? (
        <div class="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div class="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-white">No tienes eventos creados aún</h3>
          <p class="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Crea tu primer evento presencial para generar el enlace de asistencia y código QR.
          </p>
          <a
            href="/admin/events/new"
            class="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            + Crear Evento
          </a>
        </div>
      ) : currentView === "table" ? (
        /* TABLE VIEW CONTAINER: Mobile Compressed Cards + Desktop Full Table */
        <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-sm">
          {/* Mobile Compressed Cards (block md:hidden) */}
          <div class="block md:hidden divide-y divide-neutral-800/70">
            {events.map((event) => {
              const isOpen = event.status === "OPEN";
              const schedule =
                event.starts_at && event.ends_at
                  ? `${event.starts_at} - ${event.ends_at}`
                  : event.starts_at || event.ends_at || "—";

              return (
                <div class="p-4 space-y-2.5">
                  {/* Top Bar: Badge, Code & Attendees */}
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      {isOpen ? (
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Abierto
                        </span>
                      ) : (
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                          <span class="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                          Cerrado
                        </span>
                      )}
                      <span class="font-mono text-[10px] text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700/50">
                        {event.public_code}
                      </span>
                    </div>

                    <span class={`font-mono text-xs font-bold ${event.attendee_count > 0 ? "text-blue-400" : "text-neutral-500"}`}>
                      {event.attendee_count} asist.
                    </span>
                  </div>

                  {/* Title */}
                  <a href={`/admin/events/${event.id}`} class="block group">
                    <h3 class="font-bold text-white text-sm group-hover:text-blue-400 transition-colors leading-snug">
                      {event.title}
                    </h3>
                  </a>

                  {/* Details */}
                  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-400">
                    <span class="flex items-center gap-1 text-neutral-300 truncate max-w-[180px]">
                      <svg class="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span class="truncate">{event.location_name || "—"}</span>
                    </span>

                    <span>&bull;</span>

                    <span>Radio: <b class="text-neutral-300 font-mono">{event.radius_meters}m</b></span>

                    <span>&bull;</span>

                    <span class="truncate">{schedule}</span>
                  </div>

                  {/* Action Toolbar */}
                  <div class="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800/60">
                    <div class="flex items-center gap-1.5">
                      <a
                        href={`/admin/events/${event.id}`}
                        class="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Ver</span>
                      </a>

                      <a
                        href={`/admin/events/${event.id}/edit`}
                        class="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Editar</span>
                      </a>

                      <form action={`/admin/events/${event.id}/toggle`} method="post" class="inline">
                        <button
                          type="submit"
                          class={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                            isOpen
                              ? "bg-amber-950/40 text-amber-400 hover:bg-amber-900/60"
                              : "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60"
                          }`}
                        >
                          {isOpen ? "Cerrar" : "Abrir"}
                        </button>
                      </form>
                    </div>

                    <form
                      action={`/admin/events/${event.id}/delete`}
                      method="post"
                      class="inline"
                      onsubmit="return confirm('¿Seguro que deseas eliminar este evento y todos sus registros de asistencia? Esta acción no se puede deshacer.');"
                    >
                      <button
                        type="submit"
                        title="Eliminar evento"
                        class="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Full Table (hidden md:block) */}
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-left text-xs text-neutral-300">
              <thead class="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th scope="col" class="py-3.5 px-4">Estado</th>
                  <th scope="col" class="py-3.5 px-4">Título del Evento</th>
                  <th scope="col" class="py-3.5 px-4">Sede / Ubicación</th>
                  <th scope="col" class="py-3.5 px-4">Radio</th>
                  <th scope="col" class="py-3.5 px-4">Horario</th>
                  <th scope="col" class="py-3.5 px-4 text-center">Asistentes</th>
                  <th scope="col" class="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-800/70">
                {events.map((event) => {
                  const isOpen = event.status === "OPEN";
                  const schedule =
                    event.starts_at && event.ends_at
                      ? `${event.starts_at} - ${event.ends_at}`
                      : event.starts_at || event.ends_at || "—";

                  return (
                    <tr class="hover:bg-neutral-800/40 transition-colors">
                      <td class="py-3.5 px-4 whitespace-nowrap">
                        {isOpen ? (
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Abierto
                          </span>
                        ) : (
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                            <span class="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                            Cerrado
                          </span>
                        )}
                      </td>

                      <td class="py-3.5 px-4 font-medium text-white max-w-xs">
                        <div class="truncate font-semibold">{event.title}</div>
                        <div class="font-mono text-[10px] text-neutral-500">{event.public_code}</div>
                      </td>

                      <td class="py-3.5 px-4 text-neutral-300 max-w-[180px] truncate">
                        {event.location_name || "—"}
                      </td>

                      <td class="py-3.5 px-4 font-mono text-neutral-300 whitespace-nowrap">
                        {event.radius_meters}m
                      </td>

                      <td class="py-3.5 px-4 text-neutral-400 whitespace-nowrap">
                        {schedule}
                      </td>

                      <td class="py-3.5 px-4 text-center whitespace-nowrap">
                        <span class={`font-mono font-bold text-sm ${event.attendee_count > 0 ? "text-blue-400" : "text-neutral-500"}`}>
                          {event.attendee_count}
                        </span>
                      </td>

                      <td class="py-3.5 px-4 text-right whitespace-nowrap">
                        <div class="flex items-center justify-end gap-1.5">
                          {/* Detalle */}
                          <a
                            href={`/admin/events/${event.id}`}
                            title="Ver detalles y asistentes"
                            class="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </a>

                          {/* Editar */}
                          <a
                            href={`/admin/events/${event.id}/edit`}
                            title="Editar evento"
                            class="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </a>

                          {/* Toggle */}
                          <form action={`/admin/events/${event.id}/toggle`} method="post" class="inline">
                            <button
                              type="submit"
                              title={isOpen ? "Cerrar asistencia" : "Abrir asistencia"}
                              class={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isOpen
                                  ? "bg-amber-950/40 text-amber-400 hover:bg-amber-900/60"
                                  : "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60"
                              }`}
                            >
                              {isOpen ? (
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </button>
                          </form>

                          {/* Eliminar */}
                          <form
                            action={`/admin/events/${event.id}/delete`}
                            method="post"
                            class="inline"
                            onsubmit="return confirm('¿Seguro que deseas eliminar este evento y todos sus registros de asistencia? Esta acción no se puede deshacer.');"
                          >
                            <button
                              type="submit"
                              title="Eliminar evento"
                              class="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                            >
                              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div class="space-y-4">
          {events.map((event) => {
            const isOpen = event.status === "OPEN";
            const schedule =
              event.starts_at && event.ends_at
                ? `${event.starts_at} a ${event.ends_at}`
                : event.starts_at || event.ends_at || "Horario no especificado";

            return (
              <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-neutral-700/80 transition-all">
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Info Primaria */}
                  <div class="space-y-2">
                    <div class="flex items-center gap-2.5">
                      {isOpen ? (
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Abierto para Asistencia</span>
                        </span>
                      ) : (
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                          <span class="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                          <span>Cerrado / Concluido</span>
                        </span>
                      )}
                      <span class="font-mono text-xs text-neutral-500">{event.public_code}</span>
                    </div>

                    <a href={`/admin/events/${event.id}`} class="block group">
                      <h2 class="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-blue-400 transition-colors">
                        {event.title}
                      </h2>
                    </a>

                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 font-medium">
                      <span class="flex items-center gap-1.5 text-neutral-300">
                        <svg class="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.location_name || "Sede"}</span>
                      </span>

                      <span>&bull;</span>

                      <span>
                        Radio: <span class="font-mono text-neutral-200">{event.radius_meters}m</span>
                      </span>

                      <span>&bull;</span>

                      <span class="flex items-center gap-1.5 text-blue-300/90">
                        <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{schedule}</span>
                      </span>
                    </div>
                  </div>

                  {/* Contador Asistencias */}
                  <div class="sm:text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-neutral-800 pt-3 sm:pt-0">
                    <span class="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">Asistencias</span>
                    <span class={`text-2xl font-bold font-mono ${event.attendee_count > 0 ? "text-blue-400" : "text-neutral-500"}`}>
                      {event.attendee_count}
                    </span>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div class="mt-5 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
                  {/* Link público para compartir */}
                  <div class="flex items-center gap-2 text-xs">
                    <span class="text-neutral-500">Enlace:</span>
                    <a
                      href={`/asistir/${event.public_code}`}
                      target="_blank"
                      class="font-mono text-blue-400 hover:text-blue-300 underline underline-offset-2 flex items-center gap-1"
                    >
                      <span>/asistir/{event.public_code}</span>
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <button
                      type="button"
                      onclick={`copyLink('/asistir/${event.public_code}', this)`}
                      class="px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Copiar
                    </button>
                  </div>

                  {/* Botones de Administración */}
                  <div class="flex items-center gap-2">
                    {/* Ver Detalles */}
                    <a
                      href={`/admin/events/${event.id}`}
                      class="px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Ver Asistentes</span>
                    </a>

                    {/* Editar */}
                    <a
                      href={`/admin/events/${event.id}/edit`}
                      class="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 text-neutral-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Editar</span>
                    </a>

                    {/* Toggle */}
                    <form action={`/admin/events/${event.id}/toggle`} method="post" class="inline">
                      {isOpen ? (
                        <button
                          type="submit"
                          class="px-3 py-1.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Cerrar</span>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          class="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Abrir</span>
                        </button>
                      )}
                    </form>

                    {/* Eliminar */}
                    <form
                      action={`/admin/events/${event.id}/delete`}
                      method="post"
                      class="inline"
                      onsubmit="return confirm('¿Seguro que deseas eliminar este evento y todos sus registros de asistencia? Esta acción no se puede deshacer.');"
                    >
                      <button
                        type="submit"
                        class="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 text-xs font-semibold transition-all cursor-pointer flex items-center"
                        title="Eliminar evento"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <script
        dangerouslySetInnerHTML={{
          __html: `
          let modalMapInstance = null;
          let modalMarker = null;
          let modalCircle = null;

          function openQuickCreateModal() {
            const modal = document.getElementById("quickCreateModal");
            if (!modal) return;
            modal.classList.remove("hidden");

            if (typeof L !== "undefined" && !modalMapInstance) {
              const latInput = document.getElementById("modal_latitude");
              const lonInput = document.getElementById("modal_longitude");
              const radiusInput = document.getElementById("modal_radius_meters");
              const locInput = document.getElementById("modal_location_name");
              const statusEl = document.getElementById("modalOsmStatus");
              const gmapsBtn = document.getElementById("modalGmapsBtn");

              const lat = parseFloat(latInput.value) || -12.046374;
              const lon = parseFloat(lonInput.value) || -77.042793;
              const radius = parseInt(radiusInput.value, 10) || 100;

              modalMapInstance = L.map("modalEventMap", { zoomControl: false, attributionControl: false }).setView([lat, lon], 16);
              L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
              }).addTo(modalMapInstance);

              modalMarker = L.marker([lat, lon], { draggable: true }).addTo(modalMapInstance);
              modalCircle = L.circle([lat, lon], {
                radius: radius,
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.2,
                weight: 2,
              }).addTo(modalMapInstance);

              function updateModalCoords(lt, ln, queryOsm) {
                latInput.value = Number(lt).toFixed(6);
                lonInput.value = Number(ln).toFixed(6);
                modalMarker.setLatLng([lt, ln]);
                modalCircle.setLatLng([lt, ln]);
                if (gmapsBtn) gmapsBtn.href = "https://www.google.com/maps?q=" + lt + "," + ln;
                if (queryOsm) {
                  if (statusEl) statusEl.textContent = "Consultando OSM...";
                  fetch("/api/geo/reverse?lat=" + lt + "&lon=" + ln)
                    .then(r => r.json())
                    .then(d => {
                      if (d.success && d.name) {
                        locInput.value = d.name;
                        if (statusEl) {
                          statusEl.textContent = "✓ Sede sugerida: " + d.name;
                          setTimeout(() => { statusEl.textContent = ""; }, 3000);
                        }
                      }
                    }).catch(() => { if (statusEl) statusEl.textContent = ""; });
                }
              }

              modalMarker.on("dragend", function(e) {
                const p = e.target.getLatLng();
                updateModalCoords(p.lat, p.lng, true);
              });

              modalMapInstance.on("click", function(e) {
                updateModalCoords(e.latlng.lat, e.latlng.lng, true);
              });

              radiusInput.addEventListener("input", function() {
                if (modalCircle) modalCircle.setRadius(parseInt(radiusInput.value, 10) || 100);
              });

              window.setModalRadius = function(r) {
                radiusInput.value = r;
                if (modalCircle) modalCircle.setRadius(r);
              };

              const osmBtn = document.getElementById("modalQueryOsmBtn");
              if (osmBtn) {
                osmBtn.addEventListener("click", () => {
                  updateModalCoords(parseFloat(latInput.value), parseFloat(lonInput.value), true);
                });
              }

              const geoBtn = document.getElementById("modalGeoBtn");
              if (geoBtn) {
                geoBtn.addEventListener("click", () => {
                  if (!navigator.geolocation) return alert("Geolocalización no soportada");
                  navigator.geolocation.getCurrentPosition((pos) => {
                    modalMapInstance.setView([pos.coords.latitude, pos.coords.longitude], 17);
                    updateModalCoords(pos.coords.latitude, pos.coords.longitude, true);
                  });
                });
              }

              const mForm = document.getElementById("modalCreateEventForm");
              if (mForm) {
                mForm.addEventListener("submit", function() {
                  const d = document.getElementById("modal_event_date").value;
                  const st = document.getElementById("modal_start_time").value;
                  const et = document.getElementById("modal_end_time").value;
                  const startsAtEl = document.getElementById("modal_starts_at");
                  const endsAtEl = document.getElementById("modal_ends_at");
                  if (d && st && startsAtEl) startsAtEl.value = d + "T" + st;
                  if (d && et && endsAtEl) endsAtEl.value = d + "T" + et;
                });
              }
            }

            setTimeout(() => {
              if (modalMapInstance) modalMapInstance.invalidateSize();
            }, 200);
          }

          function closeQuickCreateModal() {
            const modal = document.getElementById("quickCreateModal");
            if (modal) modal.classList.add("hidden");
          }

          document.addEventListener("keydown", function(e) {
            if (e.key === "Escape") closeQuickCreateModal();
          });

          function copyLink(path, btn) {
            const fullUrl = window.location.origin + path;
            navigator.clipboard.writeText(fullUrl).then(() => {
              const originalText = btn.textContent;
              btn.textContent = "¡Copiado!";
              btn.classList.add("text-emerald-400");
              setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove("text-emerald-400");
              }, 1500);
            });
          }
        `,
        }}
      />
    
      {/* Creation Modal with Leaflet Map - Fullscreen on mobile */}
      <div
        id="quickCreateModal"
        class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-0 md:p-6 overflow-y-auto flex items-stretch md:items-center justify-center"
      >
        <div class="bg-neutral-950 md:bg-neutral-900 border-0 md:border md:border-neutral-800 rounded-none md:rounded-2xl shadow-2xl w-full min-h-screen md:min-h-0 md:max-w-2xl p-4 sm:p-6 relative overflow-y-auto flex flex-col justify-between md:justify-start">
          <div class="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 class="text-base sm:text-lg font-bold text-white tracking-tight">Crear Evento</h2>
            </div>
            <button
              type="button"
              onclick="closeQuickCreateModal()"
              class="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="Cerrar"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form id="modalCreateEventForm" action="/admin/events" method="post" class="space-y-4">
            <div>
              <label for="modal_title" class="block text-xs font-semibold text-neutral-300 mb-1">
                Título <span class="text-blue-400">*</span>
              </label>
              <input
                type="text"
                id="modal_title"
                name="title"
                required
                placeholder="Ej: Asamblea Extraordinaria 2026"
                class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-xs sm:text-sm py-2.5 px-3 focus:border-blue-500/80 focus:outline-none"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label for="modal_location_name" class="block text-xs font-semibold text-neutral-300">
                  Lugar / Sede <span class="text-blue-400">*</span>
                </label>
                <button
                  type="button"
                  id="modalQueryOsmBtn"
                  class="inline-flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Buscar en OSM</span>
                </button>
              </div>
              <input
                type="text"
                id="modal_location_name"
                name="location_name"
                required
                placeholder="Ej: Auditorio Central - Sede Lima"
                class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-xs sm:text-sm py-2.5 px-3 focus:border-blue-500/80 focus:outline-none"
              />
              <div id="modalOsmStatus" class="mt-1 text-[11px] text-emerald-400 font-medium min-h-[14px]"></div>
            </div>

            {/* Map & Controls */}
            <div class="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-3">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Ubicación GPS</span>
                </span>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    id="modalGeoBtn"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-medium cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Mi ubicación</span>
                  </button>
                  <a
                    id="modalGmapsBtn"
                    href="https://www.google.com/maps?q=-12.046374,-77.042793"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
                  >
                    <span>Google Maps</span>
                    <svg class="w-3 h-3 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              <div id="modalEventMap" class="w-full h-56 rounded-xl overflow-hidden border border-neutral-700/80 relative z-0"></div>

              <div class="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label for="modal_latitude" class="block text-[10px] text-neutral-400 mb-0.5">Latitud</label>
                  <input
                    type="number"
                    step="any"
                    id="modal_latitude"
                    name="latitude"
                    required
                    value="-12.046374"
                    class="w-full bg-neutral-800 border border-neutral-700 rounded-lg text-white font-mono p-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label for="modal_longitude" class="block text-[10px] text-neutral-400 mb-0.5">Longitud</label>
                  <input
                    type="number"
                    step="any"
                    id="modal_longitude"
                    name="longitude"
                    required
                    value="-77.042793"
                    class="w-full bg-neutral-800 border border-neutral-700 rounded-lg text-white font-mono p-1.5 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Radius */}
            <div>
              <label for="modal_radius_meters" class="block text-xs font-semibold text-neutral-300 mb-1">
                Radio (m) <span class="text-blue-400">*</span>
              </label>
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  id="modal_radius_meters"
                  name="radius_meters"
                  min={10}
                  max={5000}
                  value={100}
                  class="w-24 bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-xs sm:text-sm py-2 px-3 focus:outline-none font-mono"
                />
                <button type="button" onclick="setModalRadius(50)" class="px-2 py-1 rounded-lg bg-neutral-800 text-xs text-neutral-300 cursor-pointer">50m</button>
                <button type="button" onclick="setModalRadius(100)" class="px-2 py-1 rounded-lg bg-neutral-800 text-xs text-neutral-300 cursor-pointer">100m</button>
                <button type="button" onclick="setModalRadius(200)" class="px-2 py-1 rounded-lg bg-neutral-800 text-xs text-neutral-300 cursor-pointer">200m</button>
                <button type="button" onclick="setModalRadius(500)" class="px-2 py-1 rounded-lg bg-neutral-800 text-xs text-neutral-300 cursor-pointer">500m</button>
              </div>
            </div>

            {/* Dates */}
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div>
                <label for="modal_event_date" class="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Fecha <span class="text-blue-400">*</span>
                </label>
                <input
                  type="date"
                  id="modal_event_date"
                  name="event_date"
                  required
                  value={new Date().toISOString().split("T")[0]}
                  class="w-full bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs py-2 px-2.5 focus:outline-none"
                />
              </div>
              <div>
                <label for="modal_start_time" class="block text-[11px] font-semibold text-neutral-400 mb-1">Apertura</label>
                <input
                  type="time"
                  id="modal_start_time"
                  name="start_time"
                  value="08:30"
                  class="w-full bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs py-2 px-2.5 focus:outline-none"
                />
              </div>
              <div>
                <label for="modal_end_time" class="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Cierre <span class="text-amber-400">*</span>
                </label>
                <input
                  type="time"
                  id="modal_end_time"
                  name="end_time"
                  required
                  value="18:00"
                  class="w-full bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs py-2 px-2.5 focus:outline-none"
                />
              </div>
            </div>

            <input type="hidden" id="modal_starts_at" name="starts_at" />
            <input type="hidden" id="modal_ends_at" name="ends_at" />

            <div class="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onclick="closeQuickCreateModal()"
                class="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Crear Evento</span>
              </button>
            </div>
          </form>
        </div>
      </div>
</div>
  );
}
