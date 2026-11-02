import { Icon } from "../../../components/ui/icon";

interface FilterToolbarProps {
  totalEvents: number;
  openEvents: number;
}

export function FilterToolbar({ totalEvents, openEvents }: FilterToolbarProps) {
  return (
    <>
      <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-3 sm:p-4 space-y-3 shadow-sm">
        {/* Top Row: Search Input + Date Filter + Order Switcher */}
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div class="relative flex-1">
            <div class="absolute inset-y-0 ml-4 left-3 flex items-center pointer-events-none text-neutral-500">
              <Icon name="search" class="w-4 h-4" />
            </div>
            <input
              type="text"
              id="eventSearchInput"
              placeholder="Buscar por título, sede o código..."
              oninput="filterAndSortEvents()"
              class="w-full bg-neutral-800/90 border border-neutral-700/80 rounded-xl text-white text-sm pl-9 p-2 focus:border-blue-500/80 focus:outline-none placeholder:text-neutral-500"
            />
          </div>

          {/* Date Picker & Order Switcher */}
          <div class="flex items-center gap-2">
            {/* Date filter */}
            <div class="relative flex items-center">
              <input
                type="date"
                id="eventDateFilter"
                onchange="filterAndSortEvents()"
                title="Filtrar por fecha del evento"
                class="bg-neutral-800/90 border border-neutral-700/80 rounded-xl text-neutral-300 text-xs sm:text-sm px-2.5 py-2 focus:border-blue-500/80 focus:outline-none"
              />
              <button
                type="button"
                id="eventDateClearBtn"
                onclick="clearEventDateFilter()"
                title="Limpiar fecha"
                class="hidden ml-1 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                <Icon name="x" class="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Order Toggle: Recientes / Antiguos */}
            <button
              type="button"
              id="eventOrderToggleBtn"
              onclick="toggleEventOrder()"
              class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
              title="Cambiar orden por creación"
            >
              <span id="eventOrderLabel">Recientes</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Status Tabs + Counter */}
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/70">
          {/* Status Tabs */}
          <div class="flex items-center gap-1.5" id="eventStatusTabs">
            <button
              type="button"
              onclick="setEventStatusTab('ALL')"
              data-tab="ALL"
              class="event-tab-btn px-2 py-1 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer bg-neutral-800 border-neutral-700 text-white shadow-sm flex items-center gap-1.5"
            >
              <span>Todos</span>
            </button>

            <button
              type="button"
              onclick="setEventStatusTab('OPEN')"
              data-tab="OPEN"
              class="event-tab-btn px-2 py-1 rounded-xl text-xs sm:text-sm font-semibold border border-transparent text-neutral-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Abiertos</span>
            </button>

            <button
              type="button"
              onclick="setEventStatusTab('CLOSED')"
              data-tab="CLOSED"
              class="event-tab-btn px-2 py-1 rounded-xl text-xs sm:text-sm font-semibold border border-transparent text-neutral-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Cerrados</span>
            </button>
          </div>

          {/* Results counter */}
          <div class="text-xs text-neutral-400">
            Mostrando <strong id="eventVisibleCount" class="text-white font-bold">{totalEvents}</strong> de {totalEvents} eventos
          </div>
        </div>
      </div>

      {/* Empty Filter Results Message */}
      <div id="eventEmptyFilterMessage" class="hidden p-10 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
        <div class="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto mb-2">
          <Icon name="search" class="w-5 h-5" />
        </div>
        <p class="text-sm font-semibold text-white">No se encontraron eventos</p>
        <p class="text-xs text-neutral-400 mt-1">Ningún evento coincide con los filtros aplicados.</p>
        <button
          type="button"
          onclick="resetEventFilters()"
          class="mt-3 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-semibold cursor-pointer"
        >
          Limpiar filtros
        </button>
      </div>
    </>
  );
}
