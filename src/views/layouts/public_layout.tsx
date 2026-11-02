import type { Child } from "hono/jsx";
import { BaseHead } from "./base_head";
import { Icon } from "../components/ui/icon";

interface PublicLayoutProps {
  title: string;
  children: Child;
}

export function PublicLayout({ title, children }: PublicLayoutProps) {
  return (
    <html lang="es" class="h-full bg-neutral-950">
      <BaseHead title={`${title} — Asistencia Oficial`} />
      <body class="min-h-full flex flex-col bg-neutral-950 text-slate-100 antialiased">
        {/* Navigation Bar */}
        <header class="w-full bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-800/80 sticky top-0 z-30">
          <div class="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Icon name="shield" class="w-4 h-4" />
              </div>
              <a href="/">
                <span class="text-sm font-bold tracking-tight text-white">Control de Asistencia</span>
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
          {children}
        </main>

        {/* Footer */}
        <footer class="w-full max-w-4xl mx-auto px-4 py-6 border-t border-neutral-800/80 text-center text-xs text-neutral-500">
          <p>Sistema Oficial de Asistencia en Tiempo Real &bull; Todos los derechos reservados</p>
        </footer>
      </body>
    </html>
  );
}
