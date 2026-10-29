import type { Event } from "../db";

export function renderAttendanceView(event: Event): string {
  const isOpen = event.status === "OPEN";
  const locationName = event.location_name || "Sede presencial";
  const schedule = formatSchedule(event.starts_at, event.ends_at);

  return `<!DOCTYPE html>
<html lang="es" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${esc(event.title)} — Asistencia</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/tailwind.css">
  <style>body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; }</style>
</head>
<body class="min-h-full flex flex-col bg-neutral-950">

  <!-- Header macOS Dark -->
  <header class="w-full bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-800/60 sticky top-0 z-20">
    <div class="max-w-xl mx-auto px-5 py-3.5 flex items-center justify-between">
      
      <!-- Logo / Nombre: Asistencia -->
      <div class="flex items-center gap-2.5">
        <svg class="w-5 h-5 min-w-[20px] min-h-[20px] flex-shrink-0 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
        <span class="text-[15px] font-semibold text-neutral-200 tracking-tight">Asistencia</span>
      </div>

      <!-- Indicadores compactos: WiFi, GPS y Actualizar -->
      <div class="flex items-center gap-2 sm:gap-2.5">
        
        <!-- WiFi Chip (visible en todo dispositivo) -->
        <div id="netChip" class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800/80 text-[11px] text-neutral-300 font-medium">
          <svg class="w-3.5 h-3.5 min-w-[14px] flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
          </svg>
          <span class="text-neutral-300">WiFi</span>
          <span id="netDot" class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
        </div>

        <!-- GPS Chip (clicable para pedir permiso) -->
        <div id="gpsChip" class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800/80 text-[11px] text-neutral-300 font-medium cursor-pointer hover:bg-neutral-800 transition-colors" title="Pulsa para solicitar o actualizar ubicación">
          <svg class="w-3.5 h-3.5 min-w-[14px] flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" stroke-width="2"/>
          </svg>
          <span class="text-neutral-300">GPS</span>
          <span id="gpsDot" class="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
        </div>

        <!-- Botón Refresh -->
        <button type="button" id="refreshBtn" title="Actualizar estado"
          class="p-1.5 rounded-lg text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer">
          <svg id="refreshIcon" class="w-4 h-4 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>

      </div>
    </div>
  </header>

  <!-- Main — pegado al header -->
  <main class="flex-1 w-full max-w-xl mx-auto px-5 pt-6 pb-10">

    <!-- Titulo fuera del modal -->
    <div class="mb-5">
      <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        Registro de asistencia
      </h1>
      <p class="mt-1.5 text-sm text-neutral-500">
        Confirma tu presencia con tu documento de identidad
      </p>
    </div>

    <!-- Modal macOS Dark -->
    <div class="w-full bg-neutral-900 rounded-2xl border border-neutral-800/70 shadow-xl overflow-hidden">

      <!-- Info del evento con iconos -->
      <div class="bg-neutral-800/50 px-6 py-5 border-b border-neutral-800/60 space-y-3">

        <!-- Estado del evento -->
        <div>
          ${isOpen
            ? `<span id="eventStatusBadge" class="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-400">
                <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>Evento abierto
              </span>`
            : `<span id="eventStatusBadge" class="inline-flex items-center gap-1.5 text-[12px] font-semibold text-neutral-500">
                <span class="w-2 h-2 rounded-full bg-neutral-600 inline-block"></span>Finalizado
              </span>`
          }
        </div>

        <!-- Titulo del evento -->
        <h2 class="text-xl sm:text-2xl font-bold text-white leading-snug tracking-tight">
          ${esc(event.title)}
        </h2>

        <!-- Ubicacion con icono -->
        <div class="flex items-center gap-2.5 text-[14px] text-neutral-300">
          <svg class="w-[18px] h-[18px] text-neutral-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>${esc(locationName)}</span>
        </div>

        <!-- Radio de cobertura con icono -->
        <div class="flex items-center gap-2.5 text-[13px] text-neutral-500">
          <svg class="w-[18px] h-[18px] text-neutral-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>Radio de cobertura: ${event.radius_meters} m</span>
        </div>

        <!-- Horario con icono -->
        <div class="flex items-center gap-2.5 text-[14px] text-blue-400 font-medium">
          <svg class="w-[18px] h-[18px] text-blue-500/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>${esc(schedule)}</span>
        </div>
      </div>

      <!-- Formulario o estado finalizado -->
      <div class="px-6 py-6" id="interactiveContent">
        ${isOpen ? formHtml() : finishedHtml()}
      </div>

    </div>

    <!-- Tratamiento de datos -->
    <p class="mt-5 text-[11px] text-neutral-600 leading-relaxed">
      Al registrar tu asistencia aceptas que tu DNI, ubicacion aproximada y hora de registro sean almacenados exclusivamente para el control de asistencia de este evento. Los datos no seran compartidos con terceros. Puedes solicitar su eliminacion con el organizador.
    </p>

  </main>

  <!-- Footer -->
  <footer class="w-full border-t border-neutral-800/60 bg-neutral-900/50 backdrop-blur-sm">
    <div class="max-w-xl mx-auto px-5 py-3 text-center text-[11px] text-neutral-600">
      Sistema de asistencia presencial &mdash; Validacion geografica activa
    </div>
  </footer>

  <script>window.__EVENT_CODE__ = ${JSON.stringify(event.public_code)};</script>
  <script src="/js/asistencia.js"></script>
</body>
</html>`;
}

function formHtml(): string {
  return `
    <div class="space-y-5">
      
      <!-- Tarjeta explicita para permitir ubicacion por gesto del usuario -->
      <div id="locationPromptCard" class="hidden p-3.5 bg-blue-950/40 border border-blue-800/40 rounded-xl flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5" stroke-width="2"/>
            </svg>
          </div>
          <div>
            <div class="text-[13px] font-semibold text-blue-100">Ubicación GPS requerida</div>
            <div class="text-[11px] text-blue-300/80">Pulsa para autorizar el acceso</div>
          </div>
        </div>
        <button type="button" id="grantLocationBtn" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer whitespace-nowrap active:scale-95 transition-all">
          Permitir GPS
        </button>
      </div>

      <div>
        <label for="dniInput" class="flex items-center gap-2 text-[13px] font-semibold text-neutral-400 mb-2">
          <svg class="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
          </svg>
          Numero de DNI
        </label>
        <input
          type="text" id="dniInput" name="dni" inputmode="numeric" maxlength="8"
          autocomplete="off" autocorrect="off" spellcheck="false" placeholder="00000000"
          class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white font-mono tracking-widest text-2xl py-3.5 px-4 placeholder:text-neutral-700 focus:bg-neutral-800 focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
        />
        <p class="mt-1.5 text-[11px] text-neutral-600">Ingresa los 8 digitos numericos de tu documento</p>
      </div>

      <button type="button" id="submitBtn" disabled
        class="w-full py-3.5 px-4 bg-neutral-800 text-neutral-600 font-semibold text-[15px] rounded-xl cursor-not-allowed transition-all flex items-center justify-center gap-2.5">
        <svg id="btnSpinner" class="hidden animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span id="btnText">Registrar asistencia</span>
      </button>
    </div>
    <div id="statusContainer" class="hidden"></div>`;
}

function finishedHtml(): string {
  return `
    <div class="text-center py-6">
      <svg class="w-10 h-10 text-neutral-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p class="text-lg font-bold text-neutral-300">El registro ha finalizado</p>
      <p class="mt-1.5 text-[14px] text-neutral-500">La asistencia fue cerrada por el coordinador o se supero la hora limite.</p>
    </div>`;
}

function formatSchedule(s: string | null, e: string | null): string {
  if (s && e) return s + " — " + e;
  if (s) return "Inicio: " + s;
  if (e) return "Cierre: " + e;
  return "Horario segun convocatoria";
}

function esc(s: string): string {
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}
