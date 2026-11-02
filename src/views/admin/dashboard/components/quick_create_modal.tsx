import { getPeruDateString } from "../../../../utils/date";
import { Icon } from "../../../components/ui/icon";
import { Modal } from "../../../components/ui/modal";

export function QuickCreateModal() {
  return (
    <Modal id="quickCreateModal" title="Nuevo Evento Presencial" maxWidth="max-w-2xl" onClose="closeQuickCreateModal()">
      <form id="modalCreateEventForm" action="/admin/events" method="post" class="space-y-4">
        <div>
          <label for="modal_title" class="block text-xs sm:text-sm font-semibold text-neutral-300 mb-1">
            Título <span class="text-blue-400">*</span>
          </label>
          <input
            type="text"
            id="modal_title"
            name="title"
            required
            placeholder="Ej: Asamblea Extraordinaria 2026"
            class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2.5 px-3 focus:border-blue-500/80 focus:outline-none"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="modal_location_name" class="block text-xs sm:text-sm font-semibold text-neutral-300">
              Lugar / Sede <span class="text-blue-400">*</span>
            </label>
            <button
              type="button"
              id="modalQueryOsmBtn"
              class="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              <Icon name="refresh" class="w-3.5 h-3.5" />
              <span>Buscar en OSM</span>
            </button>
          </div>
          <input
            type="text"
            id="modal_location_name"
            name="location_name"
            required
            placeholder="Ej: Auditorio Central - Sede Lima"
            class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2.5 px-3 focus:border-blue-500/80 focus:outline-none"
          />
          <div id="modalOsmStatus" class="mt-1 text-xs text-emerald-400 font-medium min-h-[16px]"></div>
        </div>

        {/* Map & Controls */}
        <div class="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs sm:text-sm font-semibold text-neutral-200 flex items-center gap-1.5">
              <Icon name="location" class="w-4 h-4 text-blue-400" />
              <span>Ubicación GPS</span>
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                id="modalGeoBtn"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-medium cursor-pointer"
              >
                <Icon name="clock" class="w-3.5 h-3.5" />
                <span>Mi ubicación</span>
              </button>
              <a
                id="modalGmapsBtn"
                href="https://www.google.com/maps?q=-12.046374,-77.042793"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-medium"
              >
                <span>Google Maps</span>
                <Icon name="external-link" class="w-3 h-3 text-neutral-500" />
              </a>
            </div>
          </div>

          <div id="modalEventMap" class="w-full h-56 rounded-xl overflow-hidden border border-neutral-700/80 relative z-0"></div>

          <div class="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            <div>
              <label for="modal_latitude" class="block text-xs font-semibold text-neutral-400 mb-0.5">Latitud</label>
              <input
                type="number"
                step="any"
                id="modal_latitude"
                name="latitude"
                required
                value="-12.046374"
                class="w-full bg-neutral-800 border border-neutral-700 rounded-lg text-white font-mono p-2 text-xs sm:text-sm focus:outline-none"
              />
            </div>
            <div>
              <label for="modal_longitude" class="block text-xs font-semibold text-neutral-400 mb-0.5">Longitud</label>
              <input
                type="number"
                step="any"
                id="modal_longitude"
                name="longitude"
                required
                value="-77.042793"
                class="w-full bg-neutral-800 border border-neutral-700 rounded-lg text-white font-mono p-2 text-xs sm:text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Radius */}
        <div>
          <label for="modal_radius_meters" class="block text-xs sm:text-sm font-semibold text-neutral-300 mb-1">
            Radio (m) <span class="text-blue-400">*</span>
          </label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              id="modal_radius_meters"
              name="radius_meters"
              min={10}
              max={5000}
              value={100}
              class="w-24 bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2 px-3 focus:outline-none font-mono"
            />
            <button type="button" onclick="setModalRadius(50)" class="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm text-neutral-300 font-medium cursor-pointer">50m</button>
            <button type="button" onclick="setModalRadius(100)" class="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm text-neutral-300 font-medium cursor-pointer">100m</button>
            <button type="button" onclick="setModalRadius(200)" class="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm text-neutral-300 font-medium cursor-pointer">200m</button>
            <button type="button" onclick="setModalRadius(500)" class="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm text-neutral-300 font-medium cursor-pointer">500m</button>
          </div>
        </div>

        {/* Dates */}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <div>
            <label for="modal_event_date" class="block text-xs font-semibold text-neutral-300 mb-1">
              Fecha <span class="text-blue-400">*</span>
            </label>
            <input
              type="date"
              id="modal_event_date"
              name="event_date"
              required
              value={getPeruDateString()}
              class="w-full bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm py-2 px-2.5 focus:outline-none"
            />
          </div>
          <div>
            <label for="modal_start_time" class="block text-xs font-semibold text-neutral-300 mb-1">Apertura</label>
            <input
              type="time"
              id="modal_start_time"
              name="start_time"
              value="08:30"
              class="w-full bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm py-2 px-2.5 focus:outline-none"
            />
          </div>
          <div>
            <label for="modal_end_time" class="block text-xs font-semibold text-neutral-300 mb-1">
              Cierre <span class="text-amber-400">*</span>
            </label>
            <input
              type="time"
              id="modal_end_time"
              name="end_time"
              required
              value="18:00"
              class="w-full bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm py-2 px-2.5 focus:outline-none"
            />
          </div>
        </div>

        <input type="hidden" id="modal_starts_at" name="starts_at" />
        <input type="hidden" id="modal_ends_at" name="ends_at" />

        <div class="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onclick="closeQuickCreateModal()"
            class="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs sm:text-sm font-semibold hover:bg-neutral-700 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-500 shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Icon name="plus" class="w-4 h-4" />
            <span>Crear Evento</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
