import { Icon } from "../../../components/ui/icon";

export function CreateUserModal() {
  return (
    <div
      id="userCreateModal"
      class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-0 sm:p-6 overflow-y-auto flex items-stretch sm:items-center justify-center"
    >
      <div class="bg-neutral-950 sm:bg-neutral-900 border-0 sm:border sm:border-neutral-800 rounded-none sm:rounded-2xl shadow-2xl w-full min-h-screen sm:min-h-0 sm:max-w-lg p-5 sm:p-6 relative overflow-y-auto flex flex-col justify-between sm:justify-start">
        <div>
          <div class="flex items-center justify-between pb-3.5 border-b border-neutral-800 mb-5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Icon name="plus" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-base sm:text-lg font-bold text-white tracking-tight">Nuevo Coordinador</h2>
                <p class="text-xs text-neutral-400">Asigna credenciales para el personal operativo</p>
              </div>
            </div>
            <button
              type="button"
              onclick="closeCreateUserModal()"
              class="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="Cerrar"
            >
              <Icon name="x" class="w-5 h-5" />
            </button>
          </div>

          <form action="/admin/users" method="post" class="space-y-4">
            {/* DNI */}
            <div>
              <label for="create_identifier" class="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Icon name="table" class="w-3.5 h-3.5 text-neutral-500" />
                <span>DNI <span class="text-blue-400">*</span></span>
              </label>
              <input
                type="text"
                id="create_identifier"
                name="identifier"
                required
                maxlength={8}
                pattern="[0-9]{8}"
                placeholder="8 dígitos numéricos"
                class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white font-mono text-sm py-2.5 px-3.5 placeholder:text-neutral-600 focus:border-blue-500/80 focus:outline-none transition-all"
              />
            </div>

            {/* Nombre Completo */}
            <div>
              <label for="create_full_name" class="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Icon name="users" class="w-3.5 h-3.5 text-neutral-500" />
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
                <Icon name="shield" class="w-3.5 h-3.5 text-neutral-500" />
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
                <Icon name="clock" class="w-3.5 h-3.5 text-neutral-500" />
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
                <Icon name="check" class="w-4 h-4" />
                <span>+ Crear Coordinador</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
