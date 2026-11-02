import type { UserSession } from "../../../utils/auth";
import { Icon } from "../../components/ui/icon";
import { NavItem } from "./nav_item";
import { UserProfileBox } from "./user_profile_box";

interface AdminMobileNavProps {
  user: UserSession;
  activePath?: string;
}

export function AdminMobileNav({ user, activePath = "/admin" }: AdminMobileNavProps) {
  const isEventsActive = activePath === "/admin" || activePath.startsWith("/admin/events");
  const isAttendancesActive = activePath.startsWith("/admin/attendances");
  const isUsersActive = activePath.startsWith("/admin/users");

  return (
    <div x-data="{ mobileOpen: false }" class="md:hidden">
      {/* Mobile Sticky Header */}
      <div class="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-800/80 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Icon name="shield" class="w-4 h-4" />
          </div>
          <span class="text-sm font-bold tracking-tight text-white">Panel de Gestión</span>
        </div>

        <button
          type="button"
          id="mobile-menu-toggle"
          onclick="document.getElementById('mobile-sidebar').classList.toggle('hidden')"
          x-on:click="mobileOpen = !mobileOpen"
          class="p-2 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-neutral-300 hover:text-white"
          aria-label="Abrir menú"
        >
          <Icon name="menu" class="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Slide-Over Drawer */}
      <div
        id="mobile-sidebar"
        class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      >
        <div class="fixed inset-y-0 left-0 w-72 bg-neutral-900 border-r border-neutral-800 p-5 flex flex-col justify-between overflow-y-auto">
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Icon name="shield" class="w-4 h-4" />
                </div>
                <span class="text-sm font-bold text-white">Panel de Gestión</span>
              </div>
              <button
                type="button"
                onclick="document.getElementById('mobile-sidebar').classList.add('hidden')"
                x-on:click="mobileOpen = false"
                class="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-neutral-800"
                aria-label="Cerrar menú"
              >
                <Icon name="x" class="w-4 h-4" />
              </button>
            </div>

            {/* Navigation */}
            <div class="mt-4 space-y-6">
              <div>
                <div class="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 px-3">
                  Módulos Principales
                </div>
                <div class="space-y-1">
                  <NavItem
                    href="/admin"
                    icon="calendar"
                    label="Eventos Presenciales"
                    isActive={isEventsActive}
                  />
                  <NavItem
                    href="/admin/attendances"
                    icon="check"
                    label="Registro de Asistencias"
                    isActive={isAttendancesActive}
                  />
                  <NavItem
                    href="/admin/users"
                    icon="users"
                    label="Coordinadores / Personal"
                    isActive={isUsersActive}
                  />
                </div>
              </div>

              <div>
                <div class="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 px-3">
                  Próximamente
                </div>
                <div class="space-y-1">
                  <NavItem
                    href="#"
                    icon="table"
                    label="Padrón General"
                    isActive={false}
                    badge="Pronto"
                    disabled
                  />
                  <NavItem
                    href="#"
                    icon="location"
                    label="Sedes y Locales"
                    isActive={false}
                    badge="Pronto"
                    disabled
                  />
                  <NavItem
                    href="#"
                    icon="chart"
                    label="Auditoría de Accesos"
                    isActive={false}
                    badge="Pronto"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          <UserProfileBox user={user} />
        </div>
      </div>
    </div>
  );
}
