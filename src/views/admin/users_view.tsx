import type { User } from "../../db";

interface UsersViewProps {
  users: User[];
  noticeMessage?: string;
  errorMessage?: string;
}

export function UsersView({ users, noticeMessage, errorMessage }: UsersViewProps) {
  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white">Coordinadores y Personal</h1>
          <p class="text-xs text-neutral-400 mt-1">
            Administra los accesos y credenciales del equipo operativo encargado de registrar asistencias
          </p>
        </div>
      </div>

      {/* Notice Banner */}
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

      {/* Error Banner */}
      {errorMessage && (
        <div class="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2.5 shadow-sm">
          <svg class="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Form Card: Crear Nuevo Coordinador */}
      <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div class="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-800">
          <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <h2 class="text-sm font-bold text-white tracking-tight">Registrar Nuevo Coordinador</h2>
        </div>

        <form action="/admin/users" method="post" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* DNI */}
          <div>
            <label for="identifier" class="block text-xs font-semibold text-neutral-300 mb-1.5">
              DNI <span class="text-blue-400">*</span>
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              required
              maxlength={8}
              pattern="\d{8}"
              placeholder="72849102"
              class="w-full h-10 bg-neutral-800 border border-neutral-700/80 rounded-xl text-white font-mono text-sm px-3 placeholder:text-neutral-600 focus:border-blue-500/80 focus:outline-none"
            />
          </div>

          {/* Nombre Completo */}
          <div>
            <label for="full_name" class="block text-xs font-semibold text-neutral-300 mb-1.5">
              Nombre completo <span class="text-blue-400">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              required
              placeholder="Ej: Carlos Mendoza Ramos"
              class="w-full h-10 bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm px-3 placeholder:text-neutral-600 focus:border-blue-500/80 focus:outline-none"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label for="password" class="block text-xs font-semibold text-neutral-300 mb-1.5">
              Contraseña <span class="text-blue-400">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minlength={6}
              placeholder="Mínimo 6 caracteres"
              class="w-full h-10 bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-sm px-3 placeholder:text-neutral-600 focus:border-blue-500/80 focus:outline-none"
            />
          </div>

          {/* Rol y Botón Submit perfectamente alineados a la misma altura */}
          <div class="flex items-end gap-2">
            <div class="w-1/2">
              <label for="role" class="block text-xs font-semibold text-neutral-300 mb-1.5">
                Rol
              </label>
              <select
                id="role"
                name="role"
                class="w-full h-10 bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-xs px-2.5 focus:border-blue-500/80 focus:outline-none"
              >
                <option value="STAFF" selected>STAFF</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div class="w-1/2">
              <button
                type="submit"
                class="w-full h-10 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Crear</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Coordinators List: Compressed Cards on Mobile, Full Table on Desktop */}
      <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div class="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <h2 class="text-sm font-bold text-white tracking-tight">Personal Registrado</h2>
          <span class="text-xs font-mono text-neutral-400">Total: {users.length}</span>
        </div>

        {/* Mobile View: Compressed Cards (block md:hidden) */}
        <div class="block md:hidden divide-y divide-neutral-800/70">
          {users.map((u) => {
            const isSuperAdmin = u.identifier === "00000000";
            const isActive = u.status === "ACTIVE";

            return (
              <div class="p-4 space-y-2.5">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-bold text-white tracking-wider">{u.identifier}</span>
                    <span class={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                      u.role === "ADMIN"
                        ? "bg-purple-950/60 text-purple-300 border-purple-800/50"
                        : "bg-blue-950/60 text-blue-300 border-blue-800/50"
                    }`}>
                      {u.role}
                    </span>
                  </div>

                  {isActive ? (
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Activo</span>
                    </span>
                  ) : (
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                      <span class="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                      <span>Inactivo</span>
                    </span>
                  )}
                </div>

                <div class="flex items-center justify-between text-xs">
                  <div class="font-medium text-white flex items-center gap-1.5">
                    <span>{u.full_name}</span>
                    {isSuperAdmin && (
                      <span class="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40 font-semibold">
                        Principal
                      </span>
                    )}
                  </div>

                  <span class="font-mono text-neutral-500 text-[10px]">
                    {new Date(u.created_at).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div class="flex items-center justify-end gap-2 pt-1.5 border-t border-neutral-800/50">
                  {/* Toggle Status */}
                  <form action={`/admin/users/${u.id}/toggle`} method="post" class="inline">
                    <button
                      type="submit"
                      disabled={isSuperAdmin}
                      title={isSuperAdmin ? "No se puede desactivar el administrador principal" : isActive ? "Desactivar acceso" : "Activar acceso"}
                      class={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSuperAdmin
                          ? "opacity-30 cursor-not-allowed bg-neutral-800 text-neutral-500"
                          : isActive
                          ? "bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-800/40"
                          : "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40"
                      }`}
                    >
                      {isActive ? "Desactivar" : "Activar"}
                    </button>
                  </form>

                  {/* Delete User */}
                  {!isSuperAdmin && (
                    <form
                      action={`/admin/users/${u.id}/delete`}
                      method="post"
                      class="inline"
                      onsubmit="return confirm('¿Seguro que deseas eliminar este usuario coordinador?');"
                    >
                      <button
                        type="submit"
                        title="Eliminar usuario"
                        class="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Full Table (hidden md:block) */}
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left text-xs text-neutral-300">
            <thead class="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th scope="col" class="py-3.5 px-4">DNI</th>
                <th scope="col" class="py-3.5 px-4">Nombre y Apellidos</th>
                <th scope="col" class="py-3.5 px-4">Rol</th>
                <th scope="col" class="py-3.5 px-4">Estado</th>
                <th scope="col" class="py-3.5 px-4">Fecha de Alta</th>
                <th scope="col" class="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-800/70">
              {users.map((u) => {
                const isSuperAdmin = u.identifier === "00000000";
                const isActive = u.status === "ACTIVE";

                return (
                  <tr class="hover:bg-neutral-800/40 transition-colors">
                    <td class="py-3.5 px-4 font-mono font-bold text-white text-xs tracking-wider">
                      {u.identifier}
                    </td>

                    <td class="py-3.5 px-4 font-medium text-white">
                      <div class="flex items-center gap-2">
                        <span>{u.full_name}</span>
                        {isSuperAdmin && (
                          <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40 font-semibold">
                            Principal
                          </span>
                        )}
                      </div>
                    </td>

                    <td class="py-3.5 px-4">
                      <span class={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        u.role === "ADMIN"
                          ? "bg-purple-950/60 text-purple-300 border-purple-800/50"
                          : "bg-blue-950/60 text-blue-300 border-blue-800/50"
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td class="py-3.5 px-4">
                      {isActive ? (
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Activo</span>
                        </span>
                      ) : (
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                          <span class="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                          <span>Inactivo</span>
                        </span>
                      )}
                    </td>

                    <td class="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>

                    <td class="py-3.5 px-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        {/* Toggle Status */}
                        <form action={`/admin/users/${u.id}/toggle`} method="post" class="inline">
                          <button
                            type="submit"
                            disabled={isSuperAdmin}
                            title={isSuperAdmin ? "No se puede desactivar el administrador principal" : isActive ? "Desactivar acceso" : "Activar acceso"}
                            class={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isSuperAdmin
                                ? "opacity-30 cursor-not-allowed bg-neutral-800 text-neutral-500"
                                : isActive
                                ? "bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-800/40"
                                : "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40"
                            }`}
                          >
                            {isActive ? "Desactivar" : "Activar"}
                          </button>
                        </form>

                        {/* Delete User */}
                        {!isSuperAdmin && (
                          <form
                            action={`/admin/users/${u.id}/delete`}
                            method="post"
                            class="inline"
                            onsubmit="return confirm('¿Seguro que deseas eliminar este usuario coordinador?');"
                          >
                            <button
                              type="submit"
                              title="Eliminar usuario"
                              class="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                            >
                              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
