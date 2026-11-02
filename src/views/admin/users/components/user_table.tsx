import type { User } from "../../../../db";
import type { UserSession } from "../../../../utils/auth";
import { SUPER_ADMIN_IDENTIFIER } from "../../../../config";
import { formatDatePeru } from "../../../../utils/date";
import { Icon } from "../../../components/ui/icon";

interface UserTableProps {
  users: User[];
  currentUser?: UserSession;
}

export function UserTable({ users, currentUser }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-sm p-12 text-center text-xs text-neutral-500">
        <div class="w-10 h-10 text-neutral-600 mx-auto mb-3 flex items-center justify-center">
          <Icon name="users" class="w-8 h-8" />
        </div>
        <p class="font-semibold text-neutral-400">Sin coordinadores registrados</p>
        <p class="text-neutral-500 mt-1">Crea un nuevo usuario para otorgar acceso operativo.</p>
      </div>
    );
  }

  return (
    <div class="bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-sm">
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
                  <span class="font-mono font-bold text-white text-xs sm:text-sm tracking-wider">
                    {u.identifier}
                  </span>

                  <span
                    class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                      u.role === "ADMIN"
                        ? "bg-purple-950/70 text-purple-300 border-purple-800/50"
                        : "bg-blue-950/70 text-blue-300 border-blue-800/50"
                    }`}
                  >
                    {u.role}
                  </span>

                  <span
                    class={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                      u.status === "ACTIVE"
                        ? "bg-emerald-950/70 text-emerald-400 border-emerald-800/50"
                        : "bg-neutral-800 text-neutral-400 border-neutral-700/60"
                    }`}
                  >
                    <span
                      class={`w-1.5 h-1.5 rounded-full ${u.status === "ACTIVE" ? "bg-emerald-400" : "bg-neutral-500"}`}
                    ></span>
                    {u.status === "ACTIVE" ? "Activo" : "Inactivo"}
                  </span>

                  {isSelf && (
                    <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Tú
                    </span>
                  )}
                </div>

                {/* Created Date */}
                <span class="text-xs text-neutral-400 font-mono">
                  {formatDatePeru(u.created_at)}
                </span>
              </div>

              {/* Name */}
              <div class="text-base font-semibold text-neutral-100 flex items-center justify-between">
                <span>{u.full_name}</span>
              </div>

              {/* Quick Action Toolbar */}
              <div class="pt-2 border-t border-neutral-800/50 flex items-center justify-end gap-2">
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
                  class="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Editar coordinador"
                >
                  <Icon name="edit" class="w-3.5 h-3.5 text-blue-400" />
                  <span>Editar</span>
                </button>

                <form action={`/admin/users/${u.id}/toggle`} method="post" class="inline">
                  <button
                    type="submit"
                    disabled={isSuperAdmin || isSelf}
                    class={`px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      isSuperAdmin || isSelf
                        ? "opacity-40 cursor-not-allowed bg-neutral-800 text-neutral-500"
                        : u.status === "ACTIVE"
                        ? "bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/40 text-amber-300 cursor-pointer active:scale-95"
                        : "bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/40 text-emerald-300 cursor-pointer active:scale-95"
                    }`}
                    title={
                      isSuperAdmin
                        ? "Protegido"
                        : isSelf
                        ? "No puedes desactivarte"
                        : u.status === "ACTIVE"
                        ? "Desactivar"
                        : "Activar"
                    }
                  >
                    <Icon name="refresh" class="w-3.5 h-3.5" />
                    <span>{u.status === "ACTIVE" ? "Desactivar" : "Activar"}</span>
                  </button>
                </form>

                <button
                  type="button"
                  disabled={isSuperAdmin || isSelf}
                  onclick={`openDeleteUserModal(${u.id}, '${encodeURIComponent(u.full_name)}')`}
                  class={`p-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center ${
                    isSuperAdmin || isSelf
                      ? "opacity-30 cursor-not-allowed bg-neutral-800 text-neutral-600"
                      : "bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-400 cursor-pointer active:scale-95"
                  }`}
                  title={
                    isSuperAdmin
                      ? "Superadministrador protegido"
                      : isSelf
                      ? "No puedes eliminar tu cuenta"
                      : "Eliminar coordinador"
                  }
                >
                  <Icon name="trash" class="w-4 h-4" />
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
                    <span
                      class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        u.role === "ADMIN"
                          ? "bg-purple-950/70 text-purple-300 border-purple-800/50"
                          : "bg-blue-950/70 text-blue-300 border-blue-800/50"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td class="py-3.5 px-4">
                    <span
                      class={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        u.status === "ACTIVE"
                          ? "bg-emerald-950/70 text-emerald-400 border-emerald-800/50"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700/60"
                      }`}
                    >
                      <span
                        class={`w-1.5 h-1.5 rounded-full ${u.status === "ACTIVE" ? "bg-emerald-400" : "bg-neutral-500"}`}
                      ></span>
                      {u.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td class="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">
                    {formatDatePeru(u.created_at)}
                  </td>

                  <td class="py-3.5 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
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
                        title="Editar coordinador"
                        class="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Icon name="edit" class="w-3.5 h-3.5" />
                      </button>

                      <form action={`/admin/users/${u.id}/toggle`} method="post" class="inline">
                        <button
                          type="submit"
                          disabled={isSuperAdmin || isSelf}
                          title={
                            isSuperAdmin
                              ? "Protegido"
                              : isSelf
                              ? "No puedes desactivarte"
                              : u.status === "ACTIVE"
                              ? "Desactivar"
                              : "Activar"
                          }
                          class={`p-1.5 rounded-lg transition-colors ${
                            isSuperAdmin || isSelf
                              ? "opacity-30 cursor-not-allowed bg-neutral-800 text-neutral-600"
                              : u.status === "ACTIVE"
                              ? "bg-amber-950/40 text-amber-400 hover:bg-amber-900/60 cursor-pointer"
                              : "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 cursor-pointer"
                          }`}
                        >
                          <Icon name={u.status === "ACTIVE" ? "clock" : "check"} class="w-3.5 h-3.5" />
                        </button>
                      </form>

                      <button
                        type="button"
                        disabled={isSuperAdmin || isSelf}
                        onclick={`openDeleteUserModal(${u.id}, '${encodeURIComponent(u.full_name)}')`}
                        title={
                          isSuperAdmin
                            ? "Superadministrador protegido"
                            : isSelf
                            ? "No puedes eliminar tu cuenta"
                            : "Eliminar coordinador"
                        }
                        class={`p-1.5 rounded-lg transition-colors ${
                          isSuperAdmin || isSelf
                            ? "opacity-30 cursor-not-allowed bg-neutral-800 text-neutral-600"
                            : "bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 cursor-pointer"
                        }`}
                      >
                        <Icon name="trash" class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
