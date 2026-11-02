import type { UserSession } from "../../../utils/auth";
import { Icon } from "../../components/ui/icon";
import { NavItem } from "./nav_item";
import { UserProfileBox } from "./user_profile_box";

interface AdminSidebarProps {
  user: UserSession;
  activePath?: string;
}

export function AdminSidebar({ user, activePath = "/admin" }: AdminSidebarProps) {
  const isEventsActive = activePath === "/admin" || activePath.startsWith("/admin/events");
  const isAttendancesActive = activePath.startsWith("/admin/attendances");
  const isUsersActive = activePath.startsWith("/admin/users");

  return (
    <aside class="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-neutral-900/60 backdrop-blur-xl border-r border-neutral-800/80 z-30">
      <div class="flex flex-col flex-1 min-h-0">
        {/* Header / Brand */}
        <div class="px-5 py-5 border-b border-neutral-800/80 flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
            <Icon name="shield" class="w-4 h-4" />
          </div>
          <div>
            <div class="text-sm font-bold text-white tracking-tight leading-none">Panel de Gestión</div>
            <div class="text-[11px] text-neutral-400 mt-1 leading-none">Sistema de Asistencia</div>
          </div>
        </div>

        {/* Navigation Links */}
        <div class="flex-1 px-3 py-4 space-y-6 overflow-y-auto sidebar-scroll">
          <div>
            <div class="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 px-3">
              Módulos Activos
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

        {/* User Profile & Logout */}
        <div class="p-4">
          <UserProfileBox user={user} />
        </div>
      </div>
    </aside>
  );
}
