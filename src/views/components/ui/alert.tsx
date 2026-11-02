import { Icon } from "./icon";

interface AlertProps {
  type?: "info" | "success" | "error" | "warning";
  message: string;
  class?: string;
}

export function Alert({ type = "info", message, class: extraClass = "" }: AlertProps) {
  let containerStyles = "bg-blue-950/40 border-blue-800/60 text-blue-200";
  let iconName: "info" | "check" | "warning" = "info";
  let iconColor = "text-blue-400";

  switch (type) {
    case "success":
      containerStyles = "bg-emerald-950/40 border-emerald-800/60 text-emerald-200";
      iconName = "check";
      iconColor = "text-emerald-400";
      break;
    case "error":
      containerStyles = "bg-rose-950/40 border-rose-800/60 text-rose-200";
      iconName = "warning";
      iconColor = "text-rose-400";
      break;
    case "warning":
      containerStyles = "bg-amber-950/40 border-amber-800/60 text-amber-200";
      iconName = "warning";
      iconColor = "text-amber-400";
      break;
    case "info":
    default:
      containerStyles = "bg-blue-950/40 border-blue-800/60 text-blue-200";
      iconName = "info";
      iconColor = "text-blue-400";
      break;
  }

  return (
    <div
      class={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-sm ${containerStyles} ${extraClass}`}
    >
      <div class="flex items-center gap-2.5">
        <Icon name={iconName} class={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
        <span class="font-medium">{message}</span>
      </div>
    </div>
  );
}
