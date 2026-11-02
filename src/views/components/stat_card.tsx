import { Icon, type IconName } from "./ui/icon";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: IconName;
  subtitle?: string;
  highlight?: boolean;
}

export function StatCard({ title, value, icon, subtitle, highlight = false }: StatCardProps) {
  return (
    <div
      class={`p-4 rounded-2xl border transition-all ${
        highlight
          ? "bg-blue-950/20 border-blue-800/50 shadow-sm"
          : "bg-neutral-900 border-neutral-800"
      }`}
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-neutral-400">{title}</span>
        <div
          class={`p-2 rounded-xl ${
            highlight
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
              : "bg-neutral-800 text-neutral-400 border border-neutral-700/60"
          }`}
        >
          <Icon name={icon} class="w-4 h-4" />
        </div>
      </div>
      <div class="text-2xl font-bold tracking-tight text-white">{value}</div>
      {subtitle && <p class="text-[11px] text-neutral-500 mt-1">{subtitle}</p>}
    </div>
  );
}
