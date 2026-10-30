import type { Attendance } from "../../db";
import type { EventWithStats } from "../../services/event.service";

interface EventDetailViewProps {
  event: EventWithStats;
  attendances: (Attendance & { attendee_name?: string | null; attendee_base?: string | null })[];
}

export function EventDetailView({ event, attendances }: EventDetailViewProps) {
  const isOpen = event.status === "OPEN";
  const schedule =
    event.starts_at && event.ends_at
      ? `${event.starts_at} a ${event.ends_at}`
      : event.starts_at || event.ends_at || "Horario no especificado";

  const mapsUrl = `https://www.google.com/maps?q=${event.latitude},${event.longitude}`;
  const publicPath = `/asistir/${event.public_code}`;

  return (
    <div class="space-y-6">
      {/* Breadcrumb & Quick Actions Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <a
            href="/admin"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors mb-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver al Dashboard de Eventos</span>
          </a>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold tracking-tight text-white">{event.title}</h1>
            {isOpen ? (
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Abierto</span>
              </span>
            ) : (
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                <span class="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                <span>Cerrado</span>
              </span>
            )}
          </div>
          <p class="text-xs text-neutral-400 mt-1 font-mono">Código de Evento: {event.public_code}</p>
        </div>

        {/* Action Controls */}
        <div class="flex items-center gap-2">
          {/* Editar */}
          <a
            href={`/admin/events/${event.id}/edit`}
            class="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 text-neutral-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Editar Evento</span>
          </a>

          {/* Toggle */}
          <form action={`/admin/events/${event.id}/toggle`} method="post">
            {isOpen ? (
              <button
                type="submit"
                class="px-3.5 py-2 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Cerrar Registro</span>
              </button>
            ) : (
              <button
                type="submit"
                class="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Habilitar Registro</span>
              </button>
            )}
          </form>

          {/* Eliminar */}
          <form
            action={`/admin/events/${event.id}/delete`}
            method="post"
            onsubmit="return confirm('¿Seguro que deseas eliminar este evento y todas sus asistencias registradas? Esta acción no se puede deshacer.');"
          >
            <button
              type="submit"
              class="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Eliminar evento"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Main Stats: Parameters & QR Code Link Card */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Metric Cards (2 cols) */}
        <div class="lg:col-span-2 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Asistentes */}
            <div class="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80">
              <span class="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Total Registrados</span>
              <div class="text-2xl font-bold font-mono text-blue-400 mt-1">{attendances.length}</div>
            </div>

            {/* Radio Permitido */}
            <div class="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80">
              <span class="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Radio Geográfico</span>
              <div class="text-2xl font-bold font-mono text-white mt-1">{event.radius_meters}m</div>
            </div>

            {/* Horario */}
            <div class="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80">
              <span class="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Horario</span>
              <div class="text-sm font-semibold text-neutral-200 mt-1 truncate">{schedule}</div>
            </div>
          </div>

          {/* Sede y GPS Info */}
          <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800/80 space-y-3">
            <h3 class="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Ubicación Georreferenciada
            </h3>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div class="font-semibold text-white text-sm">{event.location_name || "Sede No Especificada"}</div>
                <div class="text-neutral-400 font-mono mt-0.5">
                  Lat: {event.latitude} &bull; Lon: {event.longitude}
                </div>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all text-xs font-semibold w-fit"
              >
                <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Abrir en Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        {/* QR Code & Share Card */}
        <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex flex-col justify-between">
          <div>
            <h3 class="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
              Enlace de Marcación Pública
            </h3>
            <div class="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2">
              <a
                href={publicPath}
                target="_blank"
                class="text-xs font-mono text-blue-400 hover:text-blue-300 break-all underline underline-offset-2 block"
              >
                {publicPath}
              </a>
              <button
                type="button"
                id="copyDetailBtn"
                onclick={`copyPublicLink('${publicPath}', this)`}
                class="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copiar Enlace Completo</span>
              </button>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Métodos permitidos:</span>
            <span class="font-semibold text-neutral-200">Autoservicio (GPS) + Asistido</span>
          </div>
        </div>
      </div>

      {/* Registered Attendances: Compressed Cards on Mobile, Full Table on Desktop */}
      <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div class="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold text-white tracking-tight">Listado de Asistencias Registradas</h2>
            <p class="text-[11px] text-neutral-400 mt-0.5">Participantes que marcaron presencia dentro del radio autorizado</p>
          </div>
          <span class="text-xs font-mono text-neutral-400">Total: {attendances.length}</span>
        </div>

        {attendances.length === 0 ? (
          <div class="p-8 text-center text-xs text-neutral-500">
            <svg class="w-8 h-8 text-neutral-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>No se han registrado asistencias para este evento aún.</span>
          </div>
        ) : (
          <div>
            {/* Mobile View: Compressed Cards (block md:hidden) */}
            <div class="block md:hidden divide-y divide-neutral-800/60">
              {attendances.map((att, idx) => (
                <div class="p-3.5 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-neutral-500 text-[11px]">#{idx + 1}</span>
                      <span class="font-mono font-bold text-white text-xs tracking-wider">{att.dni}</span>
                    </div>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                      {att.method === "ASSISTED" ? "Asistido" : "Autoservicio"}
                    </span>
                  </div>

                  {att.attendee_name && (
                    <div class="text-xs font-semibold text-white">
                      {att.attendee_name}
                      {att.attendee_base && <span class="text-neutral-400 font-normal ml-1">({att.attendee_base})</span>}
                    </div>
                  )}

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
              <table class="w-full text-left text-xs text-neutral-300">
                <thead class="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th scope="col" class="py-3 px-4">#</th>
                    <th scope="col" class="py-3 px-4">DNI</th>
                    <th scope="col" class="py-3 px-4">Asistente</th>
                    <th scope="col" class="py-3 px-4">Entrada</th>
                    <th scope="col" class="py-3 px-4">Salida</th>
                    <th scope="col" class="py-3 px-4">Distancia al Centro</th>
                    <th scope="col" class="py-3 px-4">Precisión GPS</th>
                    <th scope="col" class="py-3 px-4">Método</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-800/60">
                  {attendances.map((att, idx) => (
                    <tr class="hover:bg-neutral-800/30 transition-colors">
                      <td class="py-3 px-4 font-mono text-neutral-500 text-[11px]">{idx + 1}</td>
                      <td class="py-3 px-4 font-mono font-bold text-white text-xs tracking-wider">{att.dni}</td>
                      <td class="py-3 px-4 text-xs">
                        <div class="font-semibold text-white">{att.attendee_name || "-"}</div>
                        {att.attendee_base && <div class="text-[10px] text-neutral-400 font-mono">{att.attendee_base}</div>}
                      </td>
                      <td class="py-3 px-4 font-mono text-neutral-300 text-xs">
                        {new Date(att.created_at).toLocaleString("es-PE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td class="py-3 px-4 font-mono text-xs">
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
                      <td class="py-3 px-4 font-mono text-xs">
                        <span class={`font-semibold ${att.distance_meters > (event.radius_meters * 0.8) ? "text-amber-400" : "text-emerald-400"}`}>
                          {att.distance_meters}m
                        </span>
                      </td>
                      <td class="py-3 px-4 font-mono text-neutral-400 text-xs">
                        &plusmn;{Math.round(att.accuracy_meters)}m
                      </td>
                      <td class="py-3 px-4">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                          {att.method === "ASSISTED" ? "Asistido" : "Autoservicio"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          function copyPublicLink(path, btn) {
            const fullUrl = window.location.origin + path;
            navigator.clipboard.writeText(fullUrl).then(() => {
              const originalHtml = btn.innerHTML;
              btn.innerHTML = '<span class="text-emerald-400 font-semibold">¡Enlace Copiado!</span>';
              setTimeout(() => {
                btn.innerHTML = originalHtml;
              }, 1500);
            });
          }
        `,
        }}
      />
    </div>
  );
}
