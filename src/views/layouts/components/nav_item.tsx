import { Icon, type IconName } from "../../components/ui/icon";

interface NavItemProps {
  href: string;
  icon: IconName;
  label: string;
  isActive: boolean;
  badge?: string;
  disabled?: boolean;
}

export function NavItem({ href, icon, label, isActive, badge, disabled = false }: NavItemProps) {
  if (disabled) {
    return (
      <div class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-neutral-600 cursor-not-allowed select-none bg-neutral-900/40">
        <div class="flex items-center gap-3">
          <Icon name={icon} class="w-4 h-4" />
          <span>{label}</span>
        </div>
        {badge && (
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 font-medium">
            {badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <a
      href={href}
      class={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
        isActive
          ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
          : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
      }`}
    >
      <div class="flex items-center gap-3">
        <Icon name={icon} class="w-4 h-4" />
        <span>{label}</span>
      </div>
      {badge && (
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 font-medium">
          {badge}
        </span>
      )}
    </a>
  );
}
