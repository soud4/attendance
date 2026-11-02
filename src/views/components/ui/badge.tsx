export type BadgeVariant =
  | "open"
  | "closed"
  | "admin"
  | "coordinator"
  | "first_time"
  | "check_in"
  | "check_out"
  | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: any;
  class?: string;
}

export function Badge({ variant = "neutral", children, class: extraClass = "" }: BadgeProps) {
  let colorClasses = "bg-neutral-800 text-neutral-300 border-neutral-700";
  let pulseDot = false;

  switch (variant) {
    case "open":
      colorClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      pulseDot = true;
      break;
    case "closed":
      colorClasses = "bg-neutral-800 text-neutral-400 border-neutral-700/80";
      break;
    case "admin":
      colorClasses = "bg-purple-500/10 text-purple-300 border-purple-500/30";
      break;
    case "coordinator":
      colorClasses = "bg-blue-500/10 text-blue-300 border-blue-500/30";
      break;
    case "first_time":
      colorClasses = "bg-amber-500/10 text-amber-300 border-amber-500/30";
      break;
    case "check_in":
      colorClasses = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      break;
    case "check_out":
      colorClasses = "bg-sky-500/15 text-sky-300 border-sky-500/30";
      break;
    case "neutral":
    default:
      colorClasses = "bg-neutral-800 text-neutral-300 border-neutral-700";
      break;
  }

  return (
    <span
      class={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClasses} ${extraClass}`}
    >
      {pulseDot && <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
      {children}
    </span>
  );
}
