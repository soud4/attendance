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

          {/* New Event Button */}
          <a
            href="/admin/events/new"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo Evento</span>
          </a>
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
    </div>
  );
}
