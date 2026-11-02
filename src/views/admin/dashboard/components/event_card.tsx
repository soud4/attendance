import type { EventWithStats } from "../../../../services/event.service";
import { Icon } from "../../../components/ui/icon";

interface EventCardProps {
  event: EventWithStats;
}

export function EventCard({ event }: EventCardProps) {
  const isOpen = event.status === "OPEN";
  const schedule =
    event.starts_at && event.ends_at
      ? `${event.starts_at} a ${event.ends_at}`
      : event.starts_at || event.ends_at || "Horario no especificado";
  const eventDate = event.starts_at
    ? event.starts_at.slice(0, 10)
    : event.created_at
    ? event.created_at.slice(0, 10)
    : "";

  return (
    <div
      class="event-item bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-neutral-700/80 transition-all"
      data-id={event.id}
      data-title={event.title.toLowerCase()}
      data-location={(event.location_name || "").toLowerCase()}
      data-code={event.public_code.toLowerCase()}
      data-status={event.status}
      data-date={eventDate}
    >
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Info Primaria */}
        <div class="space-y-2">
          <div class="flex items-center gap-2.5">
            {isOpen ? (
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Abierto para Asistencia</span>
              </span>
            ) : (
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                <span class="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                <span>Cerrado / Concluido</span>
              </span>
            )}
            <span class="font-mono text-xs font-semibold text-neutral-400 bg-neutral-800/60 px-2 py-0.5 rounded border border-neutral-700/40">
              #{event.public_code}
            </span>
          </div>

          <h2 class="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
            <a href={`/admin/events/${event.id}`} class="hover:text-blue-400 transition-colors">
              {event.title}
            </a>
          </h2>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-neutral-400">
            <div class="flex items-center gap-1.5 text-neutral-300">
              <Icon name="location" class="w-4 h-4 text-neutral-400" />
              <span>{event.location_name || "Sin sede especificada"}</span>
            </div>

            <div class="flex items-center gap-1.5">
              <Icon name="clock" class="w-4 h-4 text-neutral-400" />
              <span>{schedule}</span>
            </div>

            <div class="flex items-center gap-1.5 font-mono text-xs">
              <span class="w-2 h-2 rounded-full bg-blue-500/80" />
              <span>Radio: {event.radius_meters}m</span>
            </div>
          </div>
        </div>

        {/* Métrica de Asistentes */}
        <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/40 sm:min-w-[120px]">
          <span class="text-xs text-neutral-400 font-medium">Asistentes</span>
          <div class="flex items-baseline gap-1 mt-0.5">
            <span class="text-2xl font-bold font-mono text-white">{event.attendee_count}</span>
            <span class="text-xs text-neutral-500">registros</span>
          </div>
        </div>
      </div>

      {/* Barra de Acciones y Enlaces */}
      <div class="mt-5 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          {/* Botón Ver Detalles */}
          <a
            href={`/admin/events/${event.id}`}
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <Icon name="users" class="w-4 h-4 text-neutral-400" />
            <span>Ver Asistencias</span>
          </a>

          {/* Botón Copiar Enlace Público */}
          <button
            type="button"
            onclick={`copyLink('/asistir/${event.public_code}', this)`}
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs sm:text-sm font-medium border border-neutral-700/60 transition-all cursor-pointer"
          >
            <Icon name="copy" class="w-4 h-4 text-neutral-400" />
            <span>Copiar Enlace</span>
          </button>

          {/* Enlace directo a marcar */}
          <a
            href={`/asistir/${event.public_code}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir página pública de marcación"
            class="p-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <Icon name="external-link" class="w-4 h-4" />
          </a>
        </div>

        {/* Acciones de Edición / Estado */}
        <div class="flex items-center gap-2">
          {/* Editar Evento */}
          <a
            href={`/admin/events/${event.id}/edit`}
            class="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs sm:text-sm font-medium transition-colors"
          >
            <Icon name="edit" class="w-3.5 h-3.5 text-neutral-400" />
            <span>Editar</span>
          </a>

          {/* Botón Toggle Estado (Abrir/Cerrar) */}
          <form action={`/admin/events/${event.id}/toggle`} method="post" class="inline">
            <button
              type="submit"
              class={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isOpen
                  ? "bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/50"
                  : "bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50"
              }`}
            >
              {isOpen ? "Cerrar Evento" : "Reabrir Evento"}
            </button>
          </form>

          {/* Eliminar Evento */}
          <form
            action={`/admin/events/${event.id}/delete`}
            method="post"
            class="inline"
            onsubmit="return confirm('¿Seguro que deseas eliminar este evento y todos sus registros de asistencia? Esta acción no se puede deshacer.');"
          >
            <button
              type="submit"
              class="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-400 transition-colors cursor-pointer"
              title="Eliminar evento"
            >
              <Icon name="trash" class="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
