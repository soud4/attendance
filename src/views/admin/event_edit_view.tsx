import type { Event } from "../../db";

interface EventEditViewProps {
  event: Event;
  errorMessage?: string;
}

export function EventEditView({ event, errorMessage }: EventEditViewProps) {
  const currentRadius = event.radius_meters || 100;

  return (
    <div class="max-w-2xl mx-auto">
      {/* Breadcrumb / Back Navigation */}
      <div class="mb-5 flex items-center justify-between">
        <a href="/admin" class="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Volver a Eventos</span>
        </a>
        <span class="text-xs text-neutral-500 font-mono">ID: {event.id} &bull; {event.public_code}</span>
      </div>

      {/* Main Card */}
      <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl shadow-xl p-6 sm:p-8">
        <div class="border-b border-neutral-800 pb-5 mb-6 flex items-start justify-between">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-white tracking-tight">Editar Evento</h1>
            <p class="text-xs text-neutral-400 mt-1">
              Modifica los detalles, coordenadas geográficas y estado de la actividad
            </p>
          </div>
          <span class={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
            event.status === "OPEN"
              ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/50"
              : "bg-neutral-800 text-neutral-400 border-neutral-700/50"
          }`}>
            {event.status === "OPEN" ? "Actualmente Abierto" : "Actualmente Cerrado"}
          </span>
        </div>

        {errorMessage && (
          <div class="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2.5">
            <svg class="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <div class="font-semibold text-rose-100">{errorMessage}</div>
            </div>
          </div>
        )}

        <form action={`/admin/events/${event.id}/edit`} method="post" class="space-y-5">
          {/* Título */}
          <div>
            <label for="title" class="block text-xs font-semibold text-neutral-300 mb-1.5">
              Título del Evento <span class="text-blue-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="Ej: Asamblea General Ordinaria 2026"
              value={event.title}
              class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-3 px-4 placeholder:text-neutral-600 focus:bg-neutral-800 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition-all"
            />
          </div>

          {/* Nombre de la Sede / Ubicación */}
          <div>
            <label for="location_name" class="block text-xs font-semibold text-neutral-300 mb-1.5">
              Nombre de la Sede o Lugar <span class="text-blue-400">*</span>
            </label>
            <input
              type="text"
              id="location_name"
              name="location_name"
              required
              placeholder="Ej: Auditorio Central - Sede Principal"
              value={event.location_name || ""}
              class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-3 px-4 placeholder:text-neutral-600 focus:bg-neutral-800 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition-all"
            />
          </div>

          {/* Coordenadas Geográficas (Latitud y Longitud) */}
          <div class="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Ubicación GPS del Evento</span>
              </span>

              <button
                type="button"
                id="geoCaptureBtn"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-medium transition-all cursor-pointer active:scale-95"
              >
                <svg id="geoIcon" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span id="geoText">Capturar ubicación actual</span>
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="latitude" class="block text-[11px] text-neutral-400 mb-1">Latitud</label>
                <input
                  type="number"
                  step="any"
                  id="latitude"
                  name="latitude"
                  required
                  placeholder="-12.046374"
                  value={event.latitude}
                  class="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl text-white font-mono text-xs py-2.5 px-3 focus:border-blue-500/80 focus:outline-none"
                />
              </div>
              <div>
                <label for="longitude" class="block text-[11px] text-neutral-400 mb-1">Longitud</label>
                <input
                  type="number"
                  step="any"
                  id="longitude"
                  name="longitude"
                  required
                  placeholder="-77.042793"
                  value={event.longitude}
                  class="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl text-white font-mono text-xs py-2.5 px-3 focus:border-blue-500/80 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Radio de Cobertura */}
          <div>
            <label for="radius_meters" class="block text-xs font-semibold text-neutral-300 mb-1.5">
              Radio de Cobertura Permitido (metros)
            </label>
            <div class="flex items-center gap-3">
              <input
                type="number"
                id="radius_meters"
                name="radius_meters"
                min="10"
                max="5000"
                required
                value={currentRadius}
                class="w-36 bg-neutral-800 border border-neutral-700/80 rounded-xl text-white font-mono text-sm py-2.5 px-3 focus:border-blue-500/80 focus:outline-none"
              />
              <div class="flex items-center gap-1.5">
                <button type="button" onclick="document.getElementById('radius_meters').value = 50" class="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer">50m</button>
                <button type="button" onclick="document.getElementById('radius_meters').value = 100" class="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer">100m</button>
                <button type="button" onclick="document.getElementById('radius_meters').value = 200" class="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer">200m</button>
                <button type="button" onclick="document.getElementById('radius_meters').value = 500" class="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer">500m</button>
              </div>
            </div>
            <p class="text-[11px] text-neutral-500 mt-1">Distancia máxima desde el centro donde los asistentes podrán registrarse.</p>
          </div>

          {/* Horarios */}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="starts_at" class="block text-xs font-semibold text-neutral-300 mb-1.5">Hora / Fecha de Inicio</label>
              <input
                type="text"
                id="starts_at"
                name="starts_at"
                placeholder="Ej: 08:30 AM"
                value={event.starts_at || ""}
                class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2.5 px-3 focus:border-blue-500/80 focus:outline-none"
              />
            </div>
            <div>
              <label for="ends_at" class="block text-xs font-semibold text-neutral-300 mb-1.5">Hora / Fecha de Cierre</label>
              <input
                type="text"
                id="ends_at"
                name="ends_at"
                placeholder="Ej: 06:00 PM"
                value={event.ends_at || ""}
                class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2.5 px-3 focus:border-blue-500/80 focus:outline-none"
              />
            </div>
          </div>

          {/* Estado del Evento */}
          <div>
            <label for="status" class="block text-xs font-semibold text-neutral-300 mb-1.5">
              Estado de Asistencia
            </label>
            <select
              id="status"
              name="status"
              class="w-full sm:w-64 bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2.5 px-3 focus:border-blue-500/80 focus:outline-none"
            >
              <option value="OPEN" selected={event.status === "OPEN"}>Abierto (Permite marcas)</option>
              <option value="CLOSED" selected={event.status === "CLOSED"}>Cerrado (Registro bloqueado)</option>
            </select>
          </div>

          {/* Botones de Acción */}
          <div class="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            <a href="/admin" class="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-all">
              Cancelar
            </a>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          const geoBtn = document.getElementById("geoCaptureBtn");
          const geoText = document.getElementById("geoText");
          const latInput = document.getElementById("latitude");
          const lonInput = document.getElementById("longitude");

          if (geoBtn) {
            geoBtn.addEventListener("click", () => {
              if (!navigator.geolocation) {
                alert("Tu navegador no soporta geolocalización.");
                return;
              }

              geoText.textContent = "Obteniendo...";
              geoBtn.disabled = true;

              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  latInput.value = pos.coords.latitude.toFixed(6);
                  lonInput.value = pos.coords.longitude.toFixed(6);
                  geoText.textContent = "Ubicación actualizada";
                  geoBtn.disabled = false;
                },
                (err) => {
                  alert("No se pudo obtener la ubicación: " + (err.message || "Permiso denegado"));
                  geoText.textContent = "Reintentar";
                  geoBtn.disabled = false;
                },
                { enableHighAccuracy: true, timeout: 10000 }
              );
            });
          }
        `,
        }}
      />
    </div>
  );
}
