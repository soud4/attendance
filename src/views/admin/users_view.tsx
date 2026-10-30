import type { User } from "../../db";
import { type UserSession } from "../../utils/auth";
import { SUPER_ADMIN_IDENTIFIER } from "../../config";

interface UsersViewProps {
  users: User[];
  currentUser?: UserSession;
  noticeMessage?: string;
  errorMessage?: string;
}

export function UsersView({ users, currentUser, noticeMessage, errorMessage }: UsersViewProps) {
  return (
    <div class="space-y-5">
      {/* Top Header Bar */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <svg class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Coordinadores y Personal</span>
          </h1>
          <p class="text-xs text-neutral-400 mt-0.5">
            Administra los accesos y roles del equipo operativo
          </p>
        </div>

        {/* Action Button: Nuevo Coordinador */}
        <button
          type="button"
          onclick="openCreateUserModal()"
          class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Coordinador</span>
        </button>
      </div>

      {/* Notice & Error Banners */}
      {noticeMessage && (
        <div class="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{noticeMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div class="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2.5 shadow-sm">
          <svg class="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Unified Search & Filters Bar */}
      <div class="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800/80 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
          {/* Live Search Input (DNI / Name) */}
          <div class="sm:col-span-5 relative">
            <svg class="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              id="userSearchInput"
              placeholder="Buscar por DNI o Nombre..."
              oninput="filterUsers()"
              class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-xs pl-9 pr-8 py-2.5 placeholder:text-neutral-500 focus:border-blue-500/80 focus:outline-none transition-all"
            />
            <button
              type="button"
              id="clearUserSearch"
              onclick="clearUserSearchInput()"
              class="hidden absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1 text-xs cursor-pointer"
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          </div>

          {/* Role Filter Pills */}
          <div id="userRoleTabs" class="sm:col-span-3 flex items-center bg-neutral-800/90 p-1 rounded-xl border border-neutral-700/60 justify-center">
            <button
              type="button"
              data-role="ALL"
              onclick="setUserRoleFilter('ALL')"
              class="user-role-tab flex-1 py-1 text-[11px] font-semibold rounded-lg bg-neutral-700 text-white shadow-sm transition-all cursor-pointer text-center"
            >
              Todos
            </button>
            <button
              type="button"
              data-role="ADMIN"
              onclick="setUserRoleFilter('ADMIN')"
              class="user-role-tab flex-1 py-1 text-[11px] font-semibold rounded-lg text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer text-center"
            >
              ADMIN
            </button>
            <button
              type="button"
              data-role="STAFF"
              onclick="setUserRoleFilter('STAFF')"
              class="user-role-tab flex-1 py-1 text-[11px] font-semibold rounded-lg text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer text-center"
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
              class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-xs px-2.5 py-2 focus:border-blue-500/80 focus:outline-none transition-all cursor-pointer [color-scheme:dark]"
              title="Filtrar por fecha de registro"
            />
          </div>

          {/* Order Sort Toggle */}
          <div class="sm:col-span-2 flex items-center gap-1.5 justify-end">
            <button
              type="button"
              id="userOrderToggleBtn"
              onclick="toggleUserOrder()"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/70 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
              title="Cambiar orden de creación"
            >
              <svg id="orderAscIcon" class="w-3.5 h-3.5 text-blue-400 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <svg id="orderDescIcon" class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
              <span id="orderLabelText">Recientes</span>
            </button>
          </div>
        </div>

        {/* Status Counter */}
        <div class="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/50">
          <div class="flex items-center gap-1.5">
            <span>Mostrando:</span>
            <strong id="userVisibleCount" class="text-white font-mono">{users.length}</strong>
            <span>de <span class="text-neutral-300 font-mono">{users.length}</span> coordinadores</span>
          </div>
          <button
            type="button"
            onclick="resetUserFilters()"
            class="text-blue-400 hover:text-blue-300 text-[11px] font-medium cursor-pointer"
          >
            Restablecer filtros
          </button>
        </div>
      </div>

      {/* Coordinators List Container */}
      <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-sm">
        {users.length === 0 ? (
          <div class="p-12 text-center text-xs text-neutral-500">
            <svg class="w-10 h-10 text-neutral-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p class="font-semibold text-neutral-400">Sin coordinadores registrados</p>
            <p class="text-neutral-500 mt-1">Crea un nuevo usuario para otorgar acceso operativo.</p>
          </div>
        ) : (
          <div>
            {/* Mobile View: Compressed Cards (block md:hidden) */}
            <div id="userMobileContainer" class="block md:hidden divide-y divide-neutral-800/60">
              {users.map((u) => {
                const isSuperAdmin = u.identifier === SUPER_ADMIN_IDENTIFIER;
                const isSelf = currentUser?.id === u.id;
                const createdDate = u.created_at ? u.created_at.split("T")[0] : "";

                return (
                  <div
                    class="user-item p-3.5 space-y-2.5 transition-colors"
                    data-id={u.id}
                    data-dni={u.identifier}
                    data-name={u.full_name.toLowerCase()}
                    data-role={u.role}
                    data-status={u.status}
                    data-date={createdDate}
                  >
                    {/* Header: DNI, Badges, Self Tag */}
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-mono font-bold text-white text-xs tracking-wider">
                          {u.identifier}
                        </span>

                        <span class={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          u.role === "ADMIN"
                            ? "bg-purple-950/70 text-purple-300 border-purple-800/50"
                            : "bg-blue-950/70 text-blue-300 border-blue-800/50"
                        }`}>
                          {u.role}
                        </span>

                        <span class={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-950/70 text-emerald-400 border-emerald-800/50"
                            : "bg-neutral-800 text-neutral-400 border-neutral-700/60"
                        }`}>
                          <span class={`w-1.5 h-1.5 rounded-full ${u.status === "ACTIVE" ? "bg-emerald-400" : "bg-neutral-500"}`}></span>
                          {u.status === "ACTIVE" ? "Activo" : "Inactivo"}
                        </span>

                        {isSelf && (
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Tú
                          </span>
                        )}
                      </div>

                      {/* Created Date */}
                      <span class="text-[10px] text-neutral-500 font-mono">
                        {new Date(u.created_at).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                      </span>
                    </div>

                    {/* Name */}
                    <div class="text-sm font-semibold text-neutral-100 flex items-center justify-between">
                      <span>{u.full_name}</span>
                    </div>

                    {/* Quick Action Toolbar with SVG Icons */}
                    <div class="pt-2 border-t border-neutral-800/50 flex items-center justify-end gap-2">
                      {/* Editar */}
                      <button
                        type="button"
                        onclick={`openEditUserModal(${JSON.stringify({
                          id: u.id,
                          identifier: u.identifier,
                          full_name: u.full_name,
                          role: u.role,
                          status: u.status,
                          isSuperAdmin,
                          isSelf,
                        })})`}
                        class="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        title="Editar coordinador"
                      >
                        <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Editar</span>
                      </button>

                      {/* Alternar Estado */}
                      <form action={`/admin/users/${u.id}/toggle`} method="post" class="inline">
                        <button
                          type="submit"
                          disabled={isSuperAdmin || isSelf}
                          class={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isSuperAdmin || isSelf
                              ? "opacity-40 cursor-not-allowed bg-neutral-800 text-neutral-500"
                              : u.status === "ACTIVE"
                              ? "bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/40 text-amber-300 cursor-pointer active:scale-95"
                              : "bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/40 text-emerald-300 cursor-pointer active:scale-95"
                          }`}
                          title={isSuperAdmin ? "Protegido" : isSelf ? "No puedes desactivarte" : u.status === "ACTIVE" ? "Desactivar" : "Activar"}
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          <span>{u.status === "ACTIVE" ? "Desactivar" : "Activar"}</span>
                        </button>
                      </form>

                      {/* Eliminar */}
                      <button
                        type="button"
                        disabled={isSuperAdmin || isSelf}
                        onclick={`openDeleteUserModal(${u.id}, '${encodeURIComponent(u.full_name)}')`}
                        class={`p-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${
                          isSuperAdmin || isSelf
                            ? "opacity-30 cursor-not-allowed bg-neutral-800 text-neutral-600"
                            : "bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-400 cursor-pointer active:scale-95"
                        }`}
                        title={isSuperAdmin ? "Superadministrador protegido" : isSelf ? "No puedes eliminar tu cuenta" : "Eliminar coordinador"}
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Table (hidden md:block) */}
            <div class="hidden md:block overflow-x-auto">
              <table id="usersTable" class="w-full text-left text-xs text-neutral-300">
                <thead class="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th scope="col" class="py-3 px-4">DNI</th>
                    <th scope="col" class="py-3 px-4">Nombre Completo</th>
                    <th scope="col" class="py-3 px-4">Rol</th>
                    <th scope="col" class="py-3 px-4">Estado</th>
                    <th scope="col" class="py-3 px-4">Fecha Creación</th>
                    <th scope="col" class="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody id="userTableBody" class="divide-y divide-neutral-800/60">
                  {users.map((u) => {
                    const isSuperAdmin = u.identifier === SUPER_ADMIN_IDENTIFIER;
                    const isSelf = currentUser?.id === u.id;
                    const createdDate = u.created_at ? u.created_at.split("T")[0] : "";

                    return (
                      <tr
                        class="user-item hover:bg-neutral-800/30 transition-colors"
                        data-id={u.id}
                        data-dni={u.identifier}
                        data-name={u.full_name.toLowerCase()}
                        data-role={u.role}
                        data-status={u.status}
                        data-date={createdDate}
                      >
                        <td class="py-3.5 px-4 font-mono font-bold text-white text-xs tracking-wider">
                          <div class="flex items-center gap-2">
                            <span>{u.identifier}</span>
                            {isSelf && (
                              <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Tú
                              </span>
                            )}
                          </div>
                        </td>

                        <td class="py-3.5 px-4 font-semibold text-white">
                          {u.full_name}
                        </td>

                        <td class="py-3.5 px-4">
                          <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            u.role === "ADMIN"
                              ? "bg-purple-950/70 text-purple-300 border-purple-800/50"
                              : "bg-blue-950/70 text-blue-300 border-blue-800/50"
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        <td class="py-3.5 px-4">
                          <span class={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-950/70 text-emerald-400 border-emerald-800/50"
                              : "bg-neutral-800 text-neutral-400 border-neutral-700/60"
                          }`}>
                            <span class={`w-1.5 h-1.5 rounded-full ${u.status === "ACTIVE" ? "bg-emerald-400" : "bg-neutral-500"}`}></span>
                            {u.status === "ACTIVE" ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        <td class="py-3.5 px-4 font-mono text-neutral-400 text-xs whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </td>

                        <td class="py-3.5 px-4 text-right">
                          <div class="flex items-center justify-end gap-2">
                            {/* Editar */}
                            <button
                              type="button"
                              onclick={`openEditUserModal(${JSON.stringify({
                                id: u.id,
                                identifier: u.identifier,
                                full_name: u.full_name,
                                role: u.role,
                                status: u.status,
                                isSuperAdmin,
                                isSelf,
                              })})`}
                              class="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
                              title="Editar coordinador"
                            >
                              <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>

                            {/* Alternar Estado */}
                            <form action={`/admin/users/${u.id}/toggle`} method="post" class="inline">
                              <button
                                type="submit"
                                disabled={isSuperAdmin || isSelf}
                                class={`p-1.5 rounded-xl transition-all ${
                                  isSuperAdmin || isSelf
                                    ? "opacity-30 cursor-not-allowed text-neutral-600"
                                    : u.status === "ACTIVE"
                                    ? "bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/40 text-amber-300 cursor-pointer"
                                    : "bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-400 cursor-pointer"
                                }`}
                                title={isSuperAdmin ? "Superadministrador protegido" : isSelf ? "No puedes desactivarte" : u.status === "ACTIVE" ? "Desactivar" : "Activar"}
                              >
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </button>
                            </form>

                            {/* Eliminar */}
                            <button
                              type="button"
                              disabled={isSuperAdmin || isSelf}
                              onclick={`openDeleteUserModal(${u.id}, '${encodeURIComponent(u.full_name)}')`}
                              class={`p-1.5 rounded-xl transition-all ${
                                isSuperAdmin || isSelf
                                  ? "opacity-30 cursor-not-allowed text-neutral-600"
                                  : "bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-400 cursor-pointer"
                              }`}
                              title={isSuperAdmin ? "Superadministrador protegido" : isSelf ? "No puedes eliminar tu cuenta" : "Eliminar coordinador"}
                            >
                              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State after filtering */}
            <div id="userEmptyFilterMessage" class="hidden p-8 text-center text-xs text-neutral-500">
              <svg class="w-8 h-8 text-neutral-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>No se encontraron coordinadores que coincidan con los filtros aplicados.</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Crear Nuevo Coordinador (Fullscreen on mobile) */}
      <div
        id="userCreateModal"
        class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-0 sm:p-6 overflow-y-auto flex items-stretch sm:items-center justify-center"
      >
        <div class="bg-neutral-950 sm:bg-neutral-900 border-0 sm:border sm:border-neutral-800 rounded-none sm:rounded-2xl shadow-2xl w-full min-h-screen sm:min-h-0 sm:max-w-lg p-5 sm:p-6 relative overflow-y-auto flex flex-col justify-between sm:justify-start">
          <div>
            <div class="flex items-center justify-between pb-3.5 border-b border-neutral-800 mb-5">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 class="text-base sm:text-lg font-bold text-white tracking-tight">Nuevo Coordinador</h2>
              </div>
              <button
                type="button"
                onclick="closeCreateUserModal()"
                class="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
                title="Cerrar"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form id="createCoordinatorForm" action="/admin/users" method="post" class="space-y-4">
              {/* DNI */}
              <div>
                <label for="create_identifier" class="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  <span>DNI <span class="text-blue-400">*</span></span>
                </label>
                <input
                  type="text"
                  id="create_identifier"
                  name="identifier"
                  required
                  maxlength={8}
                  pattern="\d{8}"
                  placeholder="8 dígitos numéricos"
                  class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white font-mono text-sm py-2.5 px-3.5 placeholder:text-neutral-600 focus:border-blue-500/80 focus:outline-none transition-all"
                />
              </div>

              {/* Nombre Completo */}
              <div>
                <label for="create_full_name" class="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Nombre completo <span class="text-blue-400">*</span></span>
                </label>
                <input
                  type="text"
                  id="create_full_name"
                  name="full_name"
                  required
                  placeholder="Ej: Carlos Mendoza Ramos"
                  class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2.5 px-3.5 placeholder:text-neutral-600 focus:border-blue-500/80 focus:outline-none transition-all"
                />
              </div>

              {/* Rol */}
              <div>
                <label for="create_role" class="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Rol asignado <span class="text-blue-400">*</span></span>
                </label>
                <select
                  id="create_role"
                  name="role"
                  class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2.5 px-3 focus:border-blue-500/80 focus:outline-none"
                >
                  <option value="STAFF" selected>STAFF (Operativo / Registro)</option>
                  <option value="ADMIN">ADMIN (Acceso Total)</option>
                </select>
              </div>

              {/* Contraseña */}
              <div>
                <label for="create_password" class="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Contraseña <span class="text-blue-400">*</span></span>
                </label>
                <input
                  type="password"
                  id="create_password"
                  name="password"
                  required
                  minlength={6}
                  placeholder="Mínimo 6 caracteres"
                  class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2.5 px-3.5 placeholder:text-neutral-600 focus:border-blue-500/80 focus:outline-none transition-all"
                />
              </div>

              <div class="pt-4 border-t border-neutral-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onclick="closeCreateUserModal()"
                  class="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>+ Crear Coordinador</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal: Editar Coordinador (Fullscreen on mobile) */}
      <div
        id="userEditModal"
        class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-0 sm:p-6 overflow-y-auto flex items-stretch sm:items-center justify-center"
      >
        <div class="bg-neutral-950 sm:bg-neutral-900 border-0 sm:border sm:border-neutral-800 rounded-none sm:rounded-2xl shadow-2xl w-full min-h-screen sm:min-h-0 sm:max-w-lg p-5 sm:p-6 relative overflow-y-auto flex flex-col justify-between sm:justify-start">
          <div>
            <div class="flex items-center justify-between pb-3.5 border-b border-neutral-800 mb-5">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-base sm:text-lg font-bold text-white tracking-tight">Editar Coordinador</h2>
                  <span id="editUserDniBadge" class="text-xs text-neutral-400 font-mono"></span>
                </div>
              </div>
              <button
                type="button"
                onclick="closeEditUserModal()"
                class="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
                title="Cerrar"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form id="editCoordinatorForm" action="" method="post" class="space-y-4">
              {/* DNI (Lectura) */}
              <div>
                <label class="block text-xs font-semibold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  <span>DNI (Inmutable)</span>
                </label>
                <input
                  type="text"
                  id="edit_identifier"
                  disabled
                  class="w-full bg-neutral-800/60 border border-neutral-700/50 rounded-xl text-neutral-400 font-mono text-sm py-2.5 px-3.5 cursor-not-allowed"
                />
              </div>

              {/* Nombre Completo */}
              <div>
                <label for="edit_full_name" class="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Nombre completo <span class="text-blue-400">*</span></span>
                </label>
                <input
                  type="text"
                  id="edit_full_name"
                  name="full_name"
                  required
                  placeholder="Ej: Carlos Mendoza Ramos"
                  class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2.5 px-3.5 placeholder:text-neutral-600 focus:border-blue-500/80 focus:outline-none transition-all"
                />
              </div>

              {/* Rol */}
              <div>
                <label for="edit_role" class="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Rol</span>
                </label>
                <select
                  id="edit_role"
                  name="role"
                  class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2.5 px-3 focus:border-blue-500/80 focus:outline-none"
                >
                  <option value="STAFF">STAFF (Operativo / Registro)</option>
                  <option value="ADMIN">ADMIN (Acceso Total)</option>
                </select>
                <p id="editRoleWarning" class="hidden text-[11px] text-amber-400 mt-1">
                  El Administrador Principal siempre debe conservar el rol ADMIN.
                </p>
              </div>

              {/* Nueva Contraseña (Opcional) */}
              <div>
                <label for="edit_password" class="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Nueva contraseña (Opcional)</span>
                </label>
                <input
                  type="password"
                  id="edit_password"
                  name="password"
                  minlength={6}
                  placeholder="Dejar en blanco para no cambiar"
                  class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm py-2.5 px-3.5 placeholder:text-neutral-500 focus:border-blue-500/80 focus:outline-none transition-all"
                />
              </div>

              <div class="pt-4 border-t border-neutral-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onclick="closeEditUserModal()"
                  class="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal: Confirmar Eliminación (macOS Dark, reemplaza window.confirm) */}
      <div
        id="userDeleteModal"
        class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center"
      >
        <div class="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-sm w-full p-5 relative">
          <div class="flex items-center gap-3 mb-3.5">
            <div class="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white tracking-tight">Eliminar Coordinador</h3>
              <p class="text-xs text-neutral-400">Esta acción no se puede deshacer.</p>
            </div>
          </div>

          <p class="text-xs text-neutral-300 leading-relaxed mb-4">
            ¿Confirmas que deseas revocar y eliminar permanentemente el acceso de <strong id="deleteUserName" class="text-white"></strong>?
          </p>

          <form id="deleteUserForm" action="" method="post" class="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onclick="closeDeleteUserModal()"
              class="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
              </svg>
              <span>Eliminar</span>
            </button>
          </form>
        </div>
      </div>

      {/* Script interactivo: Buscador, Filtros y Modales */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          let activeUserRoleFilter = "ALL";
          let activeUserOrder = "DESC"; // DESC = recientes primero, ASC = antiguos primero

          function openCreateUserModal() {
            const m = document.getElementById("userCreateModal");
            if (m) m.classList.remove("hidden");
            const inp = document.getElementById("create_identifier");
            if (inp) inp.focus();
          }

          function closeCreateUserModal() {
            const m = document.getElementById("userCreateModal");
            if (m) m.classList.add("hidden");
          }

          function openEditUserModal(user) {
            const m = document.getElementById("userEditModal");
            if (!m) return;
            const form = document.getElementById("editCoordinatorForm");
            if (form) form.action = "/admin/users/" + user.id + "/edit";

            const dniEl = document.getElementById("edit_identifier");
            const dniBadge = document.getElementById("editUserDniBadge");
            const nameEl = document.getElementById("edit_full_name");
            const roleEl = document.getElementById("edit_role");
            const passEl = document.getElementById("edit_password");
            const roleWarn = document.getElementById("editRoleWarning");

            if (dniEl) dniEl.value = user.identifier;
            if (dniBadge) dniBadge.textContent = "DNI: " + user.identifier;
            if (nameEl) nameEl.value = user.full_name;
            if (roleEl) {
              roleEl.value = user.role;
              if (user.isSuperAdmin) {
                roleEl.disabled = true;
                if (roleWarn) roleWarn.classList.remove("hidden");
              } else {
                roleEl.disabled = false;
                if (roleWarn) roleWarn.classList.add("hidden");
              }
            }
            if (passEl) passEl.value = "";

            m.classList.remove("hidden");
          }

          function closeEditUserModal() {
            const m = document.getElementById("userEditModal");
            if (m) m.classList.add("hidden");
          }

          function openDeleteUserModal(id, encodedName) {
            const m = document.getElementById("userDeleteModal");
            if (!m) return;
            const form = document.getElementById("deleteUserForm");
            if (form) form.action = "/admin/users/" + id + "/delete";
            const nameEl = document.getElementById("deleteUserName");
            if (nameEl) nameEl.textContent = decodeURIComponent(encodedName);
            m.classList.remove("hidden");
          }

          function closeDeleteUserModal() {
            const m = document.getElementById("userDeleteModal");
            if (m) m.classList.add("hidden");
          }

          // Modal escape listener
          document.addEventListener("keydown", function(e) {
            if (e.key === "Escape") {
              closeCreateUserModal();
              closeEditUserModal();
              closeDeleteUserModal();
            }
          });

          // Role Filter Tabs
          function setUserRoleFilter(role) {
            activeUserRoleFilter = role;
            document.querySelectorAll(".user-role-tab").forEach(function(btn) {
              if (btn.getAttribute("data-role") === role) {
                btn.className = "user-role-tab flex-1 py-1 text-[11px] font-semibold rounded-lg bg-neutral-700 text-white shadow-sm transition-all cursor-pointer text-center";
              } else {
                btn.className = "user-role-tab flex-1 py-1 text-[11px] font-semibold rounded-lg text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer text-center";
              }
            });
            filterUsers();
          }

          // Order Toggle
          function toggleUserOrder() {
            activeUserOrder = activeUserOrder === "DESC" ? "ASC" : "DESC";
            const descIcon = document.getElementById("orderDescIcon");
            const ascIcon = document.getElementById("orderAscIcon");
            const label = document.getElementById("orderLabelText");

            if (activeUserOrder === "DESC") {
              if (descIcon) descIcon.classList.remove("hidden");
              if (ascIcon) ascIcon.classList.add("hidden");
              if (label) label.textContent = "Recientes";
            } else {
              if (descIcon) descIcon.classList.add("hidden");
              if (ascIcon) ascIcon.classList.remove("hidden");
              if (label) label.textContent = "Antiguos";
            }
            sortAndFilterUsers();
          }

          function clearUserSearchInput() {
            const inp = document.getElementById("userSearchInput");
            if (inp) inp.value = "";
            const clr = document.getElementById("clearUserSearch");
            if (clr) clr.classList.add("hidden");
            filterUsers();
          }

          function resetUserFilters() {
            const search = document.getElementById("userSearchInput");
            const date = document.getElementById("userDateFilter");
            if (search) search.value = "";
            if (date) date.value = "";
            const clr = document.getElementById("clearUserSearch");
            if (clr) clr.classList.add("hidden");
            activeUserOrder = "DESC";
            setUserRoleFilter("ALL");
          }

          // Core Filter Engine
          function filterUsers() {
            const searchInput = document.getElementById("userSearchInput");
            const dateInput = document.getElementById("userDateFilter");
            const clr = document.getElementById("clearUserSearch");

            const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
            const dateFilter = dateInput ? dateInput.value : "";

            if (clr) {
              if (query.length > 0) clr.classList.remove("hidden");
              else clr.classList.add("hidden");
            }

            const items = document.querySelectorAll(".user-item");
            let visibleCount = 0;

            items.forEach(function(item) {
              const dni = (item.getAttribute("data-dni") || "").toLowerCase();
              const name = (item.getAttribute("data-name") || "").toLowerCase();
              const role = item.getAttribute("data-role") || "";
              const date = item.getAttribute("data-date") || "";

              // Search match
              const matchSearch = !query || dni.includes(query) || name.includes(query);

              // Role match
              const matchRole = activeUserRoleFilter === "ALL" || role === activeUserRoleFilter;

              // Date match
              const matchDate = !dateFilter || date === dateFilter;

              const isVisible = matchSearch && matchRole && matchDate;
              if (isVisible) {
                item.style.display = "";
                visibleCount++;
              } else {
                item.style.display = "none";
              }
            });

            // Adjust count in mobile vs desktop (since items are duplicated in mobile cards and desktop table)
            const isDesktop = window.innerWidth >= 768;
            const finalCount = isDesktop
              ? document.querySelectorAll("#userTableBody .user-item:not([style*='display: none'])").length
              : document.querySelectorAll("#userMobileContainer .user-item:not([style*='display: none'])").length;

            const countEl = document.getElementById("userVisibleCount");
            if (countEl) countEl.textContent = finalCount;

            const emptyMsg = document.getElementById("userEmptyFilterMessage");
            if (emptyMsg) {
              if (finalCount === 0) emptyMsg.classList.remove("hidden");
              else emptyMsg.classList.add("hidden");
            }
          }

          function sortAndFilterUsers() {
            // Sort container items
            const mobileContainer = document.getElementById("userMobileContainer");
            const tableBody = document.getElementById("userTableBody");

            function sortElements(container) {
              if (!container) return;
              const rows = Array.from(container.children).filter(el => el.classList.contains("user-item"));
              rows.sort(function(a, b) {
                const idA = parseInt(a.getAttribute("data-id") || "0", 10);
                const idB = parseInt(b.getAttribute("data-id") || "0", 10);
                return activeUserOrder === "DESC" ? idB - idA : idA - idB;
              });
              rows.forEach(r => container.appendChild(r));
            }

            sortElements(mobileContainer);
            sortElements(tableBody);
            filterUsers();
          }
        `,
        }}
      />
    </div>
  );
}
