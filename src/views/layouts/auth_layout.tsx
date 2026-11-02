import type { Child } from "hono/jsx";
import { BaseHead } from "./base_head";
import { Icon } from "../components/ui/icon";

interface AuthLayoutProps {
  title: string;
  children: Child;
}

export function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <html lang="es" class="h-full bg-neutral-950">
      <BaseHead title={`${title} — Asistencia`} />
      <body class="min-h-full flex flex-col justify-between bg-neutral-950 text-slate-100 antialiased p-4 sm:p-6">
        {/* Header Minimalista */}
        <header class="w-full max-w-md mx-auto pt-4 flex items-center justify-between text-xs text-neutral-400">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Icon name="shield" class="w-3.5 h-3.5" />
            </div>
            <span class="font-semibold text-neutral-300">Asistencia</span>
          </div>
          <span class="text-[11px] font-mono text-neutral-500">Panel v1.0</span>
        </header>

        {/* Auth Content */}
        <main class="w-full max-w-md mx-auto my-auto py-8">
          {children}
        </main>

        <footer class="text-center text-[11px] text-neutral-600 pb-2">
          Sistema de Control de Asistencia &copy; {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
