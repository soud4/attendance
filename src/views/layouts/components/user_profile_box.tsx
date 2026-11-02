import type { UserSession } from "../../../utils/auth";
import { Icon } from "../../components/ui/icon";

interface UserProfileBoxProps {
  user: UserSession;
}

export function UserProfileBox({ user }: UserProfileBoxProps) {
  return (
    <div class="pt-4 border-t border-neutral-800">
      <div class="flex items-center justify-between mb-3">
        <div class="overflow-hidden">
          <div class="text-xs font-semibold text-white truncate">{user.full_name}</div>
          <div class="text-[11px] text-neutral-400 font-mono">DNI: {user.identifier}</div>
        </div>
        <span class="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 font-semibold text-[10px] uppercase">
          {user.role}
        </span>
      </div>
      <form action="/logout" method="post">
        <button
          type="submit"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
        >
          <Icon name="logout" class="w-4 h-4 text-neutral-400" />
          <span>Cerrar Sesión</span>
        </button>
      </form>
    </div>
  );
}
