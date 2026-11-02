import { Icon } from "./icon";

interface ModalProps {
  id: string;
  title: string;
  children: any;
  maxWidth?: string;
  openVar?: string;
  onClose?: string;
}

export function Modal({
  id,
  title,
  children,
  maxWidth = "max-w-2xl",
  openVar,
  onClose,
}: ModalProps) {
  const defaultClose = `document.getElementById('${id}').classList.add('hidden')`;
  const closeAction = openVar ? `${openVar} = false` : (onClose || defaultClose);

  return (
    <div
      id={id}
      {...(openVar
        ? {
            "x-show": openVar,
            "x-transition:enter": "transition ease-out duration-200",
            "x-transition:enter-start": "opacity-0",
            "x-transition:enter-end": "opacity-100",
            "x-transition:leave": "transition ease-in duration-150",
            "x-transition:leave-start": "opacity-100",
            "x-transition:leave-end": "opacity-0",
            "x-cloak": "",
          }
        : {})}
      class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-0 md:p-6 overflow-y-auto overscroll-contain flex items-stretch md:items-center justify-center"
      {...(openVar ? { "x-on:keydown.escape.window": closeAction } : {})}
    >
      <div
        {...(openVar ? { "x-on:click.outside": closeAction } : {})}
        class={`bg-neutral-950 md:bg-neutral-900 border-0 md:border md:border-neutral-800 rounded-none md:rounded-2xl shadow-2xl w-full min-h-screen md:min-h-0 md:${maxWidth} p-4 sm:p-6 relative flex flex-col justify-between md:justify-start overscroll-contain`}
      >
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
          <h3 class="text-sm sm:text-base font-bold text-white">{title}</h3>
          <button
            type="button"
            onclick={closeAction}
            class="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Cerrar"
          >
            <Icon name="x" class="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
