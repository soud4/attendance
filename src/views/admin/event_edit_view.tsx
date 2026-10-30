import type { Event } from "../../db";

interface EventEditViewProps {
  event: Event;
  errorMessage?: string;
}

export function EventEditView({ event, errorMessage }: EventEditViewProps) {
  const currentRadius = event.radius_meters || 100;
  const currentLat = event.latitude;
  const currentLon = event.longitude;

  // Extract date and times for input elements
  const todayStr = new Date().toISOString().split("T")[0];
  let eventDate = todayStr;
  if (event.starts_at && /\d{4}-\d{2}-\d{2}/.test(event.starts_at)) {
    eventDate = event.starts_at.split("T")[0]!.split(" ")[0]!;
  } else if (event.created_at && /\d{4}-\d{2}-\d{2}/.test(event.created_at)) {
    eventDate = event.created_at.split("T")[0]!.split(" ")[0]!;
  }

  let startTime = "08:30";
  if (event.starts_at) {
    if (event.starts_at.includes("T")) {
      startTime = (event.starts_at.split("T")[1] || "").slice(0, 5);
    } else if (/^\d{1,2}:\d{2}/.test(event.starts_at)) {
      startTime = event.starts_at.slice(0, 5);
    }
  }

  let endTime = "18:00";
  if (event.ends_at) {
    if (event.ends_at.includes("T")) {
      endTime = (event.ends_at.split("T")[1] || "").slice(0, 5);
    } else if (/^\d{1,2}:\d{2}/.test(event.ends_at)) {
      endTime = event.ends_at.slice(0, 5);
    }
  }

  return (
    <div class="fixed inset-0 z-50 w-full h-full bg-neutral-950 p-4 sm:p-6 overflow-y-auto md:relative md:inset-auto md:max-w-3xl md:mx-auto md:p-0 md:bg-transparent md:h-auto">
      {/* Header bar with Back Navigation */}
      <div class="mb-4 flex items-center justify-between pb-3 border-b border-neutral-800">
        <div class="flex items-center gap-3">
          <a
            href="/admin"
            class="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Volver a Eventos"
            aria-label="Volver"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          <div>
            <h1 class="text-base sm:text-lg font-bold text-white tracking-tight">Editar Evento</h1>
            <span class="text-[11px] text-neutral-500 font-mono">{event.public_code}</span>
          </div>
        </div>
        <span class={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
          event.status === "OPEN"
            ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/50"
            : "bg-neutral-800 text-neutral-400 border-neutral-700/50"
        }`}>
          {event.status === "OPEN" ? "Abierto" : "Cerrado"}
        </span>
      </div>

      {/* Main Card */}
      <div class="bg-neutral-900 border-0 md:border border-neutral-800/80 rounded-none md:rounded-2xl shadow-none md:shadow-xl p-3 sm:p-8 min-h-[calc(100vh-5rem)] md:min-h-0">
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

        <form id="editEventForm" action={`/admin/events/${event.id}/edit`} method="post" class="space-y-5">
          {/* Título */}
          <div>
            <label for="title" class="block text-xs font-semibold text-neutral-300 mb-1.5">
              Título <span class="text-blue-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="Ej: Conferencia Anual 2026"
              value={event.title}
              class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2.5 px-3.5 placeholder:text-neutral-600 focus:bg-neutral-800 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition-all"
            />
          </div>

          {/* Sede / Lugar con botón de Geocodificación OSM */}
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="location_name" class="block text-xs font-semibold text-neutral-300">
                Lugar / Sede <span class="text-blue-400">*</span>
              </label>
              <button
                type="button"
                id="queryOsmBtn"
                class="inline-flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
                title="Actualizar nombre usando OpenStreetMap"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Buscar en OSM</span>
              </button>
            </div>
            <input
              type="text"
              id="location_name"
              name="location_name"
              required
              placeholder="Ej: Auditorio Central"
              value={event.location_name || ""}
              class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2.5 px-3.5 placeholder:text-neutral-600 focus:bg-neutral-800 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition-all"
            />
            <div id="osmStatus" class="mt-1 text-[11px] text-emerald-400 font-medium min-h-[14px]"></div>
          </div>

          {/* Mapa Interactivo Leaflet */}
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
                  id="geoCaptureBtn"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-medium transition-all cursor-pointer active:scale-95"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span id="geoText">Mi ubicación</span>
                </button>

                <a
                  id="gmapsBtn"
                  href={`https://www.google.com/maps?q=${currentLat},${currentLon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 text-neutral-300 text-xs font-medium transition-all cursor-pointer"
                  title="Abrir en Google Maps"
                >
                  <svg class="w-3.5 h-3.5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                  </svg>
                  <span>Google Maps</span>
                  <svg class="w-3 h-3 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Contenedor del Mapa Leaflet */}
            <div id="eventMap" class="w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-neutral-700/80 relative z-0"></div>

            {/* Coordenadas Latitud y Longitud */}
            <div class="grid grid-cols-2 gap-2.5 pt-0.5">
              <div>
                <label for="latitude" class="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Latitud
                </label>
                <input
                  type="number"
                  step="any"
                  id="latitude"
                  name="latitude"
                  required
                  value={currentLat}
                  class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white font-mono text-xs py-2 px-2.5 focus:border-blue-500/80 focus:outline-none"
                />
              </div>
              <div>
                <label for="longitude" class="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Longitud
                </label>
                <input
                  type="number"
                  step="any"
                  id="longitude"
                  name="longitude"
                  required
                  value={currentLon}
                  class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white font-mono text-xs py-2 px-2.5 focus:border-blue-500/80 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Radio de Cobertura */}
          <div>
            <label for="radius_meters" class="block text-xs font-semibold text-neutral-300 mb-1.5">
              Radio (m) <span class="text-blue-400">*</span>
            </label>
            <div class="flex items-center gap-2.5 flex-wrap">
              <input
                type="number"
                id="radius_meters"
                name="radius_meters"
                min={10}
                max={5000}
                required
                value={currentRadius}
                class="w-28 bg-neutral-800 border border-neutral-700/80 rounded-xl text-white font-mono text-sm py-2 px-3 focus:border-blue-500/80 focus:outline-none"
              />
              <div class="flex items-center gap-1.5 flex-wrap">
                <button type="button" onclick="setRadiusPreset(50)" class="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer">50m</button>
                <button type="button" onclick="setRadiusPreset(100)" class="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer">100m</button>
                <button type="button" onclick="setRadiusPreset(200)" class="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer">200m</button>
                <button type="button" onclick="setRadiusPreset(500)" class="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer">500m</button>
              </div>
            </div>
          </div>

          {/* Fecha y Horarios */}
          <div class="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-3">
            <span class="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Horario</span>
            </span>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Fecha */}
              <div>
                <label for="event_date" class="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Fecha <span class="text-blue-400">*</span>
                </label>
                <input
                  type="date"
                  id="event_date"
                  name="event_date"
                  required
                  value={eventDate}
                  class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-xs py-2 px-2.5 focus:border-blue-500/80 focus:outline-none"
                />
              </div>

              {/* Hora Apertura */}
              <div>
                <label for="start_time" class="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Apertura
                </label>
                <input
                  type="time"
                  id="start_time"
                  name="start_time"
                  value={startTime}
                  class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-xs py-2 px-2.5 focus:border-blue-500/80 focus:outline-none"
                />
              </div>

              {/* Hora Cierre */}
              <div>
                <label for="end_time" class="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Cierre automático <span class="text-amber-400">*</span>
                </label>
                <input
                  type="time"
                  id="end_time"
                  name="end_time"
                  required
                  value={endTime}
                  class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-xs py-2 px-2.5 focus:border-blue-500/80 focus:outline-none"
                />
              </div>
            </div>

            {/* Hidden fields for starts_at and ends_at syncing */}
            <input type="hidden" id="starts_at" name="starts_at" value={event.starts_at || ""} />
            <input type="hidden" id="ends_at" name="ends_at" value={event.ends_at || ""} />
          </div>

          {/* Estado del Evento */}
          <div>
            <label for="status" class="block text-xs font-semibold text-neutral-300 mb-1.5">
              Estado
            </label>
            <select
              id="status"
              name="status"
              class="w-full sm:w-56 bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2 px-3 focus:border-blue-500/80 focus:outline-none"
            >
              <option value="OPEN" selected={event.status === "OPEN"}>Abierto</option>
              <option value="CLOSED" selected={event.status === "CLOSED"}>Cerrado</option>
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

      {/* Script interactivo Leaflet y lógica de mapa */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            function initMap() {
              if (typeof L === "undefined") {
                setTimeout(initMap, 150);
                return;
              }

              const latInput = document.getElementById("latitude");
              const lonInput = document.getElementById("longitude");
              const radiusInput = document.getElementById("radius_meters");
              const locInput = document.getElementById("location_name");
              const statusEl = document.getElementById("osmStatus");
              const gmapsBtn = document.getElementById("gmapsBtn");
              const form = document.getElementById("editEventForm");

              let lat = parseFloat(latInput.value) || ${currentLat};
              let lon = parseFloat(lonInput.value) || ${currentLon};
              let radius = parseInt(radiusInput.value, 10) || ${currentRadius};

              const map = L.map("eventMap", { zoomControl: false, attributionControl: false }).setView([lat, lon], 16);
              L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
              }).addTo(map);

              const marker = L.marker([lat, lon], { draggable: true }).addTo(map);
              const circle = L.circle([lat, lon], {
                radius: radius,
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.2,
                weight: 2,
              }).addTo(map);

              function updateGmaps(lt, ln) {
                if (gmapsBtn) gmapsBtn.href = "https://www.google.com/maps?q=" + lt + "," + ln;
              }

              let osmTimer = null;
              function fetchOsmName(lt, ln) {
                if (statusEl) statusEl.textContent = "Consultando OSM...";
                clearTimeout(osmTimer);
                osmTimer = setTimeout(function() {
                  fetch("/api/geo/reverse?lat=" + lt + "&lon=" + ln)
                    .then(function(r) { return r.json(); })
                    .then(function(d) {
                      if (d.success && d.name) {
                        if (locInput) locInput.value = d.name;
                        if (statusEl) {
                          statusEl.textContent = "✓ Sede sugerida: " + d.name;
                          setTimeout(function() { statusEl.textContent = ""; }, 4000);
                        }
                      } else {
                        if (statusEl) statusEl.textContent = "";
                      }
                    })
                    .catch(function() {
                      if (statusEl) statusEl.textContent = "";
                    });
                }, 300);
              }

              function setCoords(lt, ln, queryOsm) {
                latInput.value = Number(lt).toFixed(6);
                lonInput.value = Number(ln).toFixed(6);
                marker.setLatLng([lt, ln]);
                circle.setLatLng([lt, ln]);
                updateGmaps(Number(lt).toFixed(6), Number(ln).toFixed(6));
                if (queryOsm) {
                  fetchOsmName(Number(lt).toFixed(6), Number(ln).toFixed(6));
                }
              }

              marker.on("dragend", function(e) {
                var p = e.target.getLatLng();
                setCoords(p.lat, p.lng, true);
              });

              map.on("click", function(e) {
                setCoords(e.latlng.lat, e.latlng.lng, true);
              });

              function updateRadius() {
                var r = parseInt(radiusInput.value, 10) || 100;
                circle.setRadius(r);
              }
              radiusInput.addEventListener("input", updateRadius);
              radiusInput.addEventListener("change", updateRadius);

              window.setRadiusPreset = function(r) {
                radiusInput.value = r;
                updateRadius();
              };

              latInput.addEventListener("change", function() {
                setCoords(parseFloat(latInput.value) || lat, parseFloat(lonInput.value) || lon, false);
                map.panTo([parseFloat(latInput.value), parseFloat(lonInput.value)]);
              });
              lonInput.addEventListener("change", function() {
                setCoords(parseFloat(latInput.value) || lat, parseFloat(lonInput.value) || lon, false);
                map.panTo([parseFloat(latInput.value), parseFloat(lonInput.value)]);
              });

              var queryBtn = document.getElementById("queryOsmBtn");
              if (queryBtn) {
                queryBtn.addEventListener("click", function() {
                  var lt = parseFloat(latInput.value);
                  var ln = parseFloat(lonInput.value);
                  if (!isNaN(lt) && !isNaN(ln)) fetchOsmName(lt, ln);
                });
              }

              var geoBtn = document.getElementById("geoCaptureBtn");
              var geoText = document.getElementById("geoText");
              if (geoBtn) {
                geoBtn.addEventListener("click", function() {
                  if (!navigator.geolocation) {
                    alert("Tu navegador no soporta geolocalización.");
                    return;
                  }
                  geoBtn.disabled = true;
                  if (geoText) geoText.textContent = "Obteniendo...";
                  navigator.geolocation.getCurrentPosition(
                    function(pos) {
                      var lt = pos.coords.latitude;
                      var ln = pos.coords.longitude;
                      map.setView([lt, ln], 17);
                      setCoords(lt, ln, true);
                      if (geoText) geoText.textContent = "Fijada";
                      geoBtn.disabled = false;
                      setTimeout(function() { if (geoText) geoText.textContent = "Mi ubicación"; }, 2500);
                    },
                    function(err) {
                      alert("No se pudo obtener la ubicación GPS: " + (err.message || "Permiso denegado"));
                      if (geoText) geoText.textContent = "Reintentar";
                      geoBtn.disabled = false;
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                  );
                });
              }

              // Sync starts_at and ends_at on form submission
              if (form) {
                form.addEventListener("submit", function() {
                  var d = document.getElementById("event_date").value;
                  var st = document.getElementById("start_time").value;
                  var et = document.getElementById("end_time").value;
                  var startsAtEl = document.getElementById("starts_at");
                  var endsAtEl = document.getElementById("ends_at");
                  if (d && st && startsAtEl) startsAtEl.value = d + "T" + st;
                  if (d && et && endsAtEl) endsAtEl.value = d + "T" + et;
                });
              }
            }

            if (document.readyState === "loading") {
              document.addEventListener("DOMContentLoaded", initMap);
            } else {
              initMap();
            }
          })();
        `,
        }}
      />
    </div>
  );
}
