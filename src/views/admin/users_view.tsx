import type { User } from "../../db";
import { type UserSession } from "../../utils/auth";
import { Alert } from "../components/ui/alert";
import { Icon } from "../components/ui/icon";
import { UserFilterToolbar } from "./users/components/user_filter_toolbar";
import { UserTable } from "./users/components/user_table";
import { CreateUserModal } from "./users/components/create_user_modal";
import { EditUserModal } from "./users/components/edit_user_modal";
import { DeleteUserModal } from "./users/components/delete_user_modal";

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
            <Icon name="users" class="w-6 h-6 text-blue-500" />
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
          <Icon name="plus" class="w-4 h-4" />
          <span>Nuevo Coordinador</span>
        </button>
      </div>

      {/* Notice & Error Banners */}
      {noticeMessage && (
        <Alert type="info" message={noticeMessage} />
      )}

      {errorMessage && (
        <Alert type="error" message={errorMessage} />
      )}

      {/* Filter, Search, Tabs & Sorting Toolbar */}
      <UserFilterToolbar totalUsers={users.length} />

      {/* Coordinators List (Mobile Cards + Desktop Table) */}
      <UserTable users={users} currentUser={currentUser} />

      {/* Modals */}
      <CreateUserModal />
      <EditUserModal />
      <DeleteUserModal />

      {/* External Client JS */}
      <script src="/js/admin/users.js" defer></script>
    </div>
  );
}
