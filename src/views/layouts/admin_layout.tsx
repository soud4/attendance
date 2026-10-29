import type { Child } from "hono/jsx";
import type { UserSession } from "../../utils/auth";

interface AdminLayoutProps {
  title: string;
  user: UserSession;
  children: Child;
}

export function AdminLayout({ title, user, children }: AdminLayoutProps) {
  return (
    <html lang="es" class="h-full bg-neutral-950">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>{title} — Panel de Gestión</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/css/tailwind.css" />
        <style>{`
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
            -webkit-font-smoothing: antialiased;
          }
        `}</style>
      </head>
      <body class="min-h-full flex flex-col justify-between bg-neutral-950 text-slate-100 antialiased">
        {/* Header macOS Dark */}
        <header class="w-full bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-800/70 sticky top-0 z-20">
          <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
            {/* Brand & Section */}
            <div class="flex items-center gap-3">
              <a href="/admin" class="flex items-center gap-2.5 text-white hover:text-blue-400 transition-colors">
                <div class="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <span class="text-base font-bold tracking-tight">Panel de Gestión</span>
              </a>
            </div>

            {/* User Session & Logout */}
            <div class="flex items-center gap-3">
              <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-xs">
                <span class="font-medium text-neutral-300">{user.full_name}</span>
                <span class="text-neutral-500">&bull;</span>
                <span class="font-mono text-neutral-400">DNI: {user.identifier}</span>
                <span class="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 font-semibold text-[10px] uppercase">
                  {user.role}
                </span>
              </div>

              <form action="/logout" method="post">
                <button
                  type="submit"
                  title="Cerrar Sesión"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 hover:border-neutral-600 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span class="hidden sm:inline">Salir</span>
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Main Content Wrapper */}
        <main class="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </main>

        {/* Footer */}
        <footer class="w-full border-t border-neutral-800/60 bg-neutral-900/50 backdrop-blur-sm py-4 px-4 text-center text-xs text-neutral-500">
          <div class="max-w-5xl mx-auto flex items-center justify-between">
            <span>Sistema de Control de Asistencia</span>
            <span>Acceso Seguro &bull; Sesión Activa</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
