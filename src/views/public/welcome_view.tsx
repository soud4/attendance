import type { Event } from "../../db";
import { formatSpanishDate, cleanTimeDisplay } from "../asistencia";

export interface WelcomeViewProps {
  events?: (Event & { is_active: boolean })[];
}

export function WelcomeView({ events = [] }: WelcomeViewProps = {}) {
  return (
    <html lang="es" class="h-full bg-neutral-950">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="view-transition" content="same-origin" />
        <title>Control de Asistencia — Eventos Oficiales</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/css/tailwind.css" />
        <style>{`
          @view-transition {
            navigation: auto;
          }
          ::view-transition-old(root),
          ::view-transition-new(root) {
            animation-duration: 0.15s;
            animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
            -webkit-font-smoothing: antialiased;
          }
        `}</style>
      </head>
      <body class="min-h-full flex flex-col bg-neutral-950 text-slate-100 antialiased">
        {/* Navigation Bar */}
        <header class="w-full bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-800/80 sticky top-0 z-30">
          <div class="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span class="text-sm font-bold tracking-tight text-white">Control de Asistencia</span>
            </div>

            <a
              href="/login"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Acceso Administrativo</span>
            </a>
          </div>
        </header>

        {/* Main Content Area */}
        <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
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
              <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 class="text-sm font-bold tracking-tight text-white uppercase tracking-wider">
                Eventos Recientes
              </h2>
            </div>
            <span class="text-xs text-neutral-500 font-mono">Últimos {events.length}</span>
          </div>

          {/* Events List / Grid */}
          {events.length === 0 ? (
            <div class="p-10 text-center rounded-2xl bg-neutral-900 border border-neutral-800/80 text-xs text-neutral-500">
              <svg class="w-10 h-10 text-neutral-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
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
                  // Active event: Pulseable / Clickable with prominent active border
                  return (
                    <a
                      href={`/asistir/${evt.public_code}`}
                      class="group relative flex flex-col justify-between p-5 rounded-2xl bg-neutral-900 border-2 border-emerald-500/80 hover:border-emerald-400 shadow-xl shadow-emerald-950/30 hover:shadow-emerald-900/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
                    >
                      {/* Active Status Ribbon / Badge */}
                      <div class="flex items-start justify-between gap-2 mb-3">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 shadow-sm">
                          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>En curso</span>
                        </span>
                        <span class="text-[11px] font-mono text-neutral-500">{evt.public_code}</span>
                      </div>

                      {/* Event Title */}
                      <div class="mb-3">
                        <h3 class="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                          {evt.title}
                        </h3>
                      </div>

                      {/* Venue / Location & Schedule */}
                      <div class="space-y-1.5 text-xs text-neutral-400 mb-4">
                        <div class="flex items-center gap-2 text-neutral-300">
                          <svg class="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span class="truncate">{evt.location_name || "Sede presencial"}</span>
                        </div>

                        <div class="flex items-center gap-2 text-neutral-400 text-[11px]">
                          <svg class="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{readableDate}</span>
                        </div>

                        <div class="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                          <svg class="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{openingTime} &ndash; {closingTime}</span>
                          <span class="text-neutral-600">&bull;</span>
                          <span class="text-neutral-500">Radio: {evt.radius_meters}m</span>
                        </div>
                      </div>

                      {/* Card Footer / Action */}
                      <div class="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                        <span>Registrar Asistencia</span>
                        <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  );
                }

                // Inactive / Closed / Expired event: Not clickable / Disabled
                return (
                  <div class="relative flex flex-col justify-between p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 opacity-60 cursor-not-allowed select-none">
                    {/* Inactive Badge */}
                    <div class="flex items-start justify-between gap-2 mb-3">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                        <span class="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                        <span>Finalizado</span>
                      </span>
                      <span class="text-[11px] font-mono text-neutral-600">{evt.public_code}</span>
                    </div>

                    {/* Event Title */}
                    <div class="mb-3">
                      <h3 class="text-base sm:text-lg font-semibold text-neutral-400 line-clamp-2">
                        {evt.title}
                      </h3>
                    </div>

                    {/* Venue / Location & Schedule */}
                    <div class="space-y-1.5 text-xs text-neutral-500 mb-4">
                      <div class="flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span class="truncate">{evt.location_name || "Sede presencial"}</span>
                      </div>

                      <div class="flex items-center gap-2 text-[11px]">
                        <svg class="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{readableDate}</span>
                      </div>

                      <div class="flex items-center gap-2 text-[11px] font-mono text-neutral-600">
                        <svg class="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{openingTime} &ndash; {closingTime}</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div class="pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500 font-medium">
                      <span>Registro no disponible</span>
                      <svg class="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer class="w-full border-t border-neutral-800/80 bg-neutral-900/40 py-4 px-6 text-xs text-neutral-500">
          <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Servicio operativo &bull; Validación geográfica activa</span>
            </div>
            <span>Sistema de Asistencia Presencial</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
