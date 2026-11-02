import { Icon } from "../../../components/ui/icon";

export function DeleteUserModal() {
  return (
    <div
      id="userDeleteModal"
      class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center"
    >
      <div class="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
            <Icon name="warning" class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-white">Eliminar Coordinador</h2>
            <p class="text-xs text-neutral-400">Esta acción no se puede deshacer</p>
          </div>
        </div>

        <p class="text-xs text-neutral-300 leading-relaxed mb-5">
          ¿Estás seguro de que deseas revocar el acceso a{" "}
          <strong id="deleteUserName" class="text-white font-semibold"></strong>? Ya no podrá acceder al panel de gestión.
        </p>

        <form id="deleteUserForm" action="" method="post" class="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onclick="closeDeleteUserModal()"
            class="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 cursor-pointer flex items-center gap-1.5"
          >
            <Icon name="trash" class="w-3.5 h-3.5" />
            <span>Eliminar Acceso</span>
          </button>
        </form>
      </div>
    </div>
  );
}
