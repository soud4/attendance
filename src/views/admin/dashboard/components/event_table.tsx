import type { EventWithStats } from "../../../../services/event.service";
import { Icon } from "../../../components/ui/icon";

interface EventTableProps {
  events: EventWithStats[];
}

export function EventTable({ events }: EventTableProps) {
  return (
    <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-sm">
      {/* Mobile Compressed Cards (block md:hidden) */}
      <div class="block md:hidden divide-y divide-neutral-800/70" id="eventTableMobileContainer">
        {events.map((event) => {
          const isOpen = event.status === "OPEN";
          const schedule =
            event.starts_at && event.ends_at
              ? `${event.starts_at} - ${event.ends_at}`
              : event.starts_at || event.ends_at || "—";
          const eventDate = event.starts_at
            ? event.starts_at.slice(0, 10)
            : event.created_at
            ? event.created_at.slice(0, 10)
            : "";

          return (
            <div
              class="event-item p-4 space-y-3"
              data-id={event.id}
              data-title={event.title.toLowerCase()}
              data-location={(event.location_name || "").toLowerCase()}
              data-code={event.public_code.toLowerCase()}
              data-status={event.status}
              data-date={eventDate}
            >
              {/* Top Bar: Badge, Code & Attendees */}
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  {isOpen ? (
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Abierto
                    </span>
                  ) : (
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                      <span class="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                      Cerrado
                    </span>
                  )}
                  <span class="font-mono text-xs text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700/50 font-semibold">
                    #{event.public_code}
                  </span>
                </div>

                <span class={`font-mono text-sm font-bold ${event.attendee_count > 0 ? "text-blue-400" : "text-neutral-500"}`}>
                  {event.attendee_count} asist.
                </span>
              </div>

              {/* Title */}
              <a href={`/admin/events/${event.id}`} class="block group">
                <h3 class="font-bold text-white text-base group-hover:text-blue-400 transition-colors leading-snug">
                  {event.title}
                </h3>
              </a>

              {/* Details */}
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-300">
                <span class="flex items-center gap-1.5 truncate max-w-[200px]">
                  <Icon name="location" class="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <span class="truncate">{event.location_name || "—"}</span>
                </span>

                <span>&bull;</span>

                <span>Radio: <b class="text-white font-mono">{event.radius_meters}m</b></span>

                <span>&bull;</span>

                <span class="truncate">{schedule}</span>
              </div>

              {/* Action Toolbar */}
              <div class="flex items-center justify-between gap-2 pt-2.5 border-t border-neutral-800/60">
                <div class="flex items-center gap-1.5">
                  <a
                    href={`/admin/events/${event.id}`}
                    class="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1"
                  >
                    <Icon name="users" class="w-3.5 h-3.5 text-neutral-400" />
                    <span>Ver</span>
                  </a>

                  <a
                    href={`/admin/events/${event.id}/edit`}
                    class="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1"
                  >
                    <Icon name="edit" class="w-3.5 h-3.5 text-neutral-400" />
                    <span>Editar</span>
                  </a>

                  <button
                    type="button"
                    onclick={`copyLink('/asistir/${event.public_code}', this)`}
                    class="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Icon name="copy" class="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copiar</span>
                  </button>
                </div>

                <div class="flex items-center gap-1.5">
                  <form action={`/admin/events/${event.id}/toggle`} method="post" class="inline">
                    <button
                      type="submit"
                      class={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                        isOpen
                          ? "bg-amber-950/40 text-amber-400 border border-amber-800/50"
                          : "bg-emerald-950/40 text-emerald-400 border border-emerald-800/50"
                      }`}
                    >
                      {isOpen ? "Cerrar" : "Abrir"}
                    </button>
                  </form>

                  <form
                    action={`/admin/events/${event.id}/delete`}
                    method="post"
                    class="inline"
                    onsubmit="return confirm('¿Seguro que deseas eliminar este evento?');"
                  >
                    <button
                      type="submit"
                      class="p-2 rounded-xl bg-red-950/40 text-red-400 hover:bg-red-900/60 transition-colors cursor-pointer"
                    >
                      <Icon name="trash" class="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (hidden md:block) */}
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-neutral-800 bg-neutral-900/90 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              <th class="py-3.5 px-4">Estado</th>
              <th class="py-3.5 px-4">Código</th>
              <th class="py-3.5 px-4">Evento / Título</th>
              <th class="py-3.5 px-4">Sede / Ubicación</th>
              <th class="py-3.5 px-4">Horario</th>
              <th class="py-3.5 px-4 text-center">Radio</th>
              <th class="py-3.5 px-4 text-center">Asistentes</th>
              <th class="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody id="eventTableBody" class="divide-y divide-neutral-800/60 text-xs sm:text-sm">
            {events.map((event) => {
              const isOpen = event.status === "OPEN";
              const schedule =
                event.starts_at && event.ends_at
                  ? `${event.starts_at} a ${event.ends_at}`
                  : event.starts_at || event.ends_at || "—";
              const eventDate = event.starts_at
                ? event.starts_at.slice(0, 10)
                : event.created_at
                ? event.created_at.slice(0, 10)
                : "";

              return (
                <tr
                  class="event-item hover:bg-neutral-800/30 transition-colors"
                  data-id={event.id}
                  data-title={event.title.toLowerCase()}
                  data-location={(event.location_name || "").toLowerCase()}
                  data-code={event.public_code.toLowerCase()}
                  data-status={event.status}
                  data-date={eventDate}
                >
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    {isOpen ? (
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Abierto
                      </span>
                    ) : (
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                        <span class="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                        Cerrado
                      </span>
                    )}
                  </td>
                  <td class="py-3.5 px-4 font-mono text-neutral-400 whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded bg-neutral-800 text-xs border border-neutral-700/60 font-semibold">
                      {event.public_code}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 font-semibold text-white max-w-xs">
                    <a href={`/admin/events/${event.id}`} class="hover:text-blue-400 transition-colors block truncate">
                      {event.title}
                    </a>
                  </td>
                  <td class="py-3.5 px-4 text-neutral-300 max-w-[200px] truncate">
                    {event.location_name || "—"}
                  </td>
                  <td class="py-3.5 px-4 text-neutral-400 whitespace-nowrap text-xs">
                    {schedule}
                  </td>
                  <td class="py-3.5 px-4 text-center whitespace-nowrap font-mono text-neutral-400 text-xs">
                    {event.radius_meters}m
                  </td>
                  <td class="py-3.5 px-4 text-center whitespace-nowrap font-mono font-bold text-sm">
                    <span class={event.attendee_count > 0 ? "text-blue-400" : "text-neutral-500"}>
                      {event.attendee_count}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1.5">
                      <a
                        href={`/admin/events/${event.id}`}
                        title="Ver detalles"
                        class="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                      >
                        <Icon name="users" class="w-4 h-4" />
                      </a>

                      <a
                        href={`/admin/events/${event.id}/edit`}
                        title="Editar evento"
                        class="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                      >
                        <Icon name="edit" class="w-4 h-4" />
                      </a>

                      <form action={`/admin/events/${event.id}/toggle`} method="post" class="inline">
                        <button
                          type="submit"
                          title={isOpen ? "Cerrar asistencia" : "Abrir asistencia"}
                          class={`p-2 rounded-lg transition-colors cursor-pointer ${
                            isOpen
                              ? "bg-amber-950/40 text-amber-400 hover:bg-amber-900/60"
                              : "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60"
                          }`}
                        >
                          <Icon name={isOpen ? "clock" : "check"} class="w-4 h-4" />
                        </button>
                      </form>

                      <form
                        action={`/admin/events/${event.id}/delete`}
                        method="post"
                        class="inline"
                        onsubmit="return confirm('¿Seguro que deseas eliminar este evento?');"
                      >
                        <button
                          type="submit"
                          title="Eliminar evento"
                          class="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                        >
                          <Icon name="trash" class="w-4 h-4" />
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
  );
}
