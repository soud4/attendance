import { Icon } from "../../../components/ui/icon";

interface UserFilterToolbarProps {
  totalUsers: number;
}

export function UserFilterToolbar({ totalUsers }: UserFilterToolbarProps) {
  return (
    <>
      <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-3 sm:p-4 space-y-3 shadow-sm">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search Box */}
          <div class="sm:col-span-5 relative">
            <div class="absolute left-3 top-2.5 text-neutral-500">
              <Icon name="search" class="w-4 h-4" />
            </div>
            <input
              type="text"
              id="userSearchInput"
              oninput="filterUsers()"
              placeholder="Buscar por DNI o nombre..."
              class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm pl-9 pr-8 py-2 focus:border-blue-500/80 focus:outline-none placeholder:text-neutral-500 transition-all"
            />
            <button
              type="button"
              id="clearUserSearch"
              onclick="clearUserSearchInput()"
              class="hidden absolute right-2.5 top-2 text-neutral-400 hover:text-white"
            >
              <Icon name="x" class="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Role Filter Tabs */}
          <div id="userRoleTabs" class="sm:col-span-3 flex items-center bg-neutral-800/90 border border-neutral-700/80 rounded-xl p-1 gap-1">
            <button
              type="button"
              data-role="ALL"
              onclick="setUserRoleFilter('ALL')"
              class="user-role-tab flex-1 py-1 text-xs font-semibold rounded-lg bg-neutral-700 text-white shadow-sm transition-all cursor-pointer text-center"
            >
              Todos
            </button>
            <button
              type="button"
              data-role="ADMIN"
              onclick="setUserRoleFilter('ADMIN')"
              class="user-role-tab flex-1 py-1 text-xs font-semibold rounded-lg text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer text-center"
            >
              ADMIN
            </button>
            <button
              type="button"
              data-role="STAFF"
              onclick="setUserRoleFilter('STAFF')"
              class="user-role-tab flex-1 py-1 text-xs font-semibold rounded-lg text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer text-center"
            >
              STAFF
            </button>
          </div>

          {/* Date Filter */}
          <div class="sm:col-span-2 relative">
            <input
              type="date"
              id="userDateFilter"
              onchange="filterUsers()"
              class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-xs sm:text-sm px-2.5 py-2 focus:border-blue-500/80 focus:outline-none transition-all cursor-pointer [color-scheme:dark]"
              title="Filtrar por fecha de registro"
            />
          </div>

          {/* Order Sort Toggle */}
          <div class="sm:col-span-2 flex items-center gap-1.5 justify-end">
            <button
              type="button"
              id="userOrderToggleBtn"
              onclick="toggleUserOrder()"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/70 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
              title="Cambiar orden de creación"
            >
              <div id="orderAscIcon" class="text-blue-400 hidden">
                <Icon name="refresh" class="w-3.5 h-3.5" />
              </div>
              <div id="orderDescIcon" class="text-blue-400">
                <Icon name="refresh" class="w-3.5 h-3.5" />
              </div>
              <span id="orderLabelText">Recientes</span>
            </button>
          </div>
        </div>

        {/* Status Counter */}
        <div class="flex items-center justify-between text-xs text-neutral-400 pt-1 border-t border-neutral-800/50">
          <div class="flex items-center gap-1.5">
            <span>Mostrando:</span>
            <strong id="userVisibleCount" class="text-white font-mono font-bold">{totalUsers}</strong>
            <span>de <span class="text-neutral-300 font-mono">{totalUsers}</span> coordinadores</span>
          </div>
          <button
            type="button"
            onclick="resetUserFilters()"
            class="text-blue-400 hover:text-blue-300 text-xs font-semibold cursor-pointer"
          >
            Restablecer filtros
          </button>
        </div>
      </div>

      {/* Empty Filter Results Message */}
      <div id="userEmptyFilterMessage" class="hidden p-10 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
        <div class="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto mb-2">
          <Icon name="search" class="w-5 h-5" />
        </div>
        <p class="text-sm font-semibold text-white">No se encontraron coordinadores</p>
        <p class="text-xs text-neutral-400 mt-1">Ningún usuario coincide con los filtros aplicados.</p>
        <button
          type="button"
          onclick="resetUserFilters()"
          class="mt-3 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-semibold cursor-pointer"
        >
          Limpiar filtros
        </button>
      </div>
    </>
  );
}
