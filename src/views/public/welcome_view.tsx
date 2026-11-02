import type { Event } from "../../db";
import { formatSpanishDate, cleanTimeDisplay } from "../asistencia";
import { PublicLayout } from "../layouts/public_layout";
import { Icon } from "../components/ui/icon";

export interface WelcomeViewProps {
  events?: (Event & { is_active: boolean })[];
}

export function WelcomeView({ events = [] }: WelcomeViewProps = {}) {
  return (
    <PublicLayout title="Control de Asistencia — Eventos Oficiales">
      {/* Hero Section */}
      <div class="text-center mb-8 sm:mb-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-[11px] font-semibold text-blue-300 uppercase tracking-wider mb-3">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>Plataforma Presencial</span>
        </div>

        <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          Eventos Oficiales
        </h1>

        <p class="mt-2 text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
          Selecciona tu evento para registrar tu asistencia presencial. Solo los eventos en curso permiten marcación geográfica.
        </p>
      </div>

      {/* Events Section Header */}
      <div class="flex items-center justify-between mb-4 pb-2 border-b border-neutral-800/80">
        <div class="flex items-center gap-2">
          <Icon name="calendar" class="w-4 h-4 text-blue-400" />
          <h2 class="text-sm font-bold tracking-tight text-white uppercase tracking-wider">
            Eventos Recientes
          </h2>
        </div>
        <span class="text-xs text-neutral-500 font-mono">Últimos {events.length}</span>
      </div>

      {/* Events List / Grid */}
      {events.length === 0 ? (
        <div class="p-10 text-center rounded-2xl bg-neutral-900 border border-neutral-800/80 text-xs text-neutral-500">
          <div class="w-10 h-10 text-neutral-600 mx-auto mb-3 flex items-center justify-center">
            <Icon name="calendar" class="w-8 h-8" />
          </div>
          <p class="font-semibold text-neutral-400">Sin eventos disponibles</p>
          <p class="mt-1 text-neutral-500">No se encontraron eventos registrados en este momento.</p>
        </div>
      ) : (
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((evt) => {
            const readableDate = formatSpanishDate(evt.starts_at, evt.created_at);
            const openingTime = cleanTimeDisplay(evt.starts_at, "08:00 AM");
            const closingTime = cleanTimeDisplay(evt.ends_at, "06:00 PM");

            if (evt.is_active) {
              return (
                <a
                  href={`/asistir/${evt.public_code}`}
                  class="group relative flex flex-col justify-between p-5 rounded-2xl bg-neutral-900 border-2 border-emerald-500/80 hover:border-emerald-400 shadow-xl shadow-emerald-950/30 hover:shadow-emerald-900/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div class="flex items-start justify-between gap-2 mb-3">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 shadow-sm">
                      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>En curso</span>
                    </span>
                    <span class="text-[11px] font-mono text-neutral-500">{evt.public_code}</span>
                  </div>

                  <div class="mb-3">
                    <h3 class="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                      {evt.title}
                    </h3>
                  </div>

                  <div class="space-y-1.5 text-xs text-neutral-400 mb-4">
                    <div class="flex items-center gap-2 text-neutral-300">
                      <Icon name="location" class="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span class="truncate">{evt.location_name || "Sede presencial"}</span>
                    </div>

                    <div class="flex items-center gap-2 text-neutral-400 text-[11px]">
                      <Icon name="calendar" class="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                      <span>{readableDate}</span>
                    </div>

                    <div class="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                      <Icon name="clock" class="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                      <span>{openingTime} &ndash; {closingTime}</span>
                      <span class="text-neutral-600">&bull;</span>
                      <span class="text-neutral-500">Radio: {evt.radius_meters}m</span>
                    </div>
                  </div>

                  <div class="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                    <span>Registrar Asistencia</span>
                    <Icon name="chevron-right" class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              );
            }

            return (
              <div
                class="relative flex flex-col justify-between p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 opacity-75 cursor-not-allowed select-none"
              >
                <div class="flex items-start justify-between gap-2 mb-3">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                    <span class="w-2 h-2 rounded-full bg-neutral-500" />
                    <span>Finalizado</span>
                  </span>
                  <span class="text-[11px] font-mono text-neutral-500">{evt.public_code}</span>
                </div>

                <div class="mb-3">
                  <h3 class="text-base sm:text-lg font-bold text-neutral-300 line-clamp-2">
                    {evt.title}
                  </h3>
                </div>

                <div class="space-y-1.5 text-xs text-neutral-500 mb-4">
                  <div class="flex items-center gap-2 text-neutral-400">
                    <Icon name="location" class="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                    <span class="truncate">{evt.location_name || "Sede presencial"}</span>
                  </div>

                  <div class="flex items-center gap-2 text-[11px]">
                    <Icon name="calendar" class="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                    <span>{readableDate}</span>
                  </div>

                  <div class="flex items-center gap-2 text-[11px] font-mono">
                    <Icon name="clock" class="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                    <span>{openingTime} &ndash; {closingTime}</span>
                  </div>
                </div>

                <div class="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-neutral-500">
                  <span>Registro no disponible</span>
                  <Icon name="check" class="w-4 h-4 text-neutral-600" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PublicLayout>
  );
}
