import type { EventWithStats } from "../../services/event.service";

interface DashboardViewProps {
  events: EventWithStats[];
  noticeMessage?: string;
}

export function DashboardView({ events, noticeMessage }: DashboardViewProps) {
  const totalEvents = events.length;
  const openEvents = events.filter((e) => e.status === "OPEN").length;
  const totalAttendances = events.reduce((sum, e) => sum + e.attendee_count, 0);

  return (
    <div class="space-y-6">
      {/* Top Action Bar */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white">Eventos Registrados</h1>
          <p class="text-xs text-neutral-400 mt-1">Supervisa y controla la asistencia de tus actividades presenciales</p>
        </div>

        <a
          href="/admin/events/new"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Evento</span>
        </a>
      </div>

      {/* Notice / Alert Banner */}
      {noticeMessage && (
        <div class="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 text-xs flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{noticeMessage}</span>
          </div>
        </div>
      )}

      {/* Stat Summary Cards */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Eventos */}
        <div class="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div class="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Total Eventos</div>
            <div class="text-xl font-bold text-white font-mono mt-0.5">{totalEvents}</div>
          </div>
        </div>

        {/* Eventos Abiertos */}
        <div class="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-950/50 text-emerald-400 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div class="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">En Curso (Abiertos)</div>
            <div class="text-xl font-bold text-emerald-400 font-mono mt-0.5">{openEvents}</div>
          </div>
        </div>

        {/* Total Asistencias */}
        <div class="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-blue-950/50 text-blue-400 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div class="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Asistencias Totales</div>
            <div class="text-xl font-bold text-blue-400 font-mono mt-0.5">{totalAttendances}</div>
          </div>
        </div>
      </div>

      {/* Event Cards Grid / List */}
      <div class="space-y-4">
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
        ) : (
          events.map((event) => {
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

                    <h2 class="text-lg font-bold text-white tracking-tight leading-snug">
                      {event.title}
                    </h2>

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
                      class="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Copiar
                    </button>
                  </div>

                  {/* Botones de Control del Evento */}
                  <div class="flex items-center gap-2">
                    <form action={`/admin/events/${event.id}/toggle`} method="post">
                      {isOpen ? (
                        <button
                          type="submit"
                          class="px-3 py-1.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Cerrar Asistencia</span>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          class="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Abrir Asistencia</span>
                        </button>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

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
