import type { Child } from "hono/jsx";
import type { UserSession } from "../../utils/auth";

interface AdminLayoutProps {
  title: string;
  user: UserSession;
  activePath?: string;
  children: Child;
}

export function AdminLayout({ title, user, activePath = "/admin", children }: AdminLayoutProps) {
  const isEventsActive = activePath === "/admin" || activePath.startsWith("/admin/events");
  const isAttendancesActive = activePath.startsWith("/admin/attendances");
  const isUsersActive = activePath.startsWith("/admin/users");

  return (
    <html lang="es" class="h-full bg-neutral-950">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="view-transition" content="same-origin" />
        <title>{title} — Panel de Gestión</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/css/tailwind.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
        <style>{`
          @view-transition {
            navigation: auto;
          }
          ::view-transition-old(root),
          ::view-transition-new(root) {
            animation-duration: 0.15s;
            animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          /* Custom scrollbar for desktop sidebar */
          .sidebar-scroll::-webkit-scrollbar {
            width: 4px;
          }
          /* Hide Leaflet watermark and zoom controls for a minimalist UI */
          .leaflet-control-attribution,
          .leaflet-control-zoom {
            display: none !important;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #262626;
            border-radius: 4px;
          }
          .leaflet-container {
            font-family: inherit;
            background: #171717;
          }
        `}</style>
      </head>
      <body class="min-h-full bg-neutral-950 text-slate-100 antialiased flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div class="md:hidden sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-800/80 px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span class="text-sm font-bold tracking-tight text-white">Panel de Gestión</span>
          </div>

          <button
            type="button"
            id="mobile-menu-toggle"
            onclick="document.getElementById('mobile-sidebar').classList.toggle('hidden')"
            class="p-2 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-neutral-300 hover:text-white"
            aria-label="Abrir menú"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Backdrop & Drawer */}
        <div id="mobile-sidebar" class="hidden md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <div class="fixed inset-y-0 left-0 w-72 bg-neutral-900 border-r border-neutral-800 p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <span class="text-sm font-bold text-white">Panel de Gestión</span>
                </div>
                <button
                  type="button"
                  onclick="document.getElementById('mobile-sidebar').classList.add('hidden')"
                  class="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-neutral-800"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation */}
              <div class="mt-4 space-y-6">
                <div>
                  <div class="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 px-3">
                    Módulos Principales
                  </div>
                  <div class="space-y-1">
                    <a
                      href="/admin"
                      class={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isEventsActive
                          ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                          : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                      }`}
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Eventos Presenciales</span>
                    </a>

                    <a
                      href="/admin/attendances"
                      class={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isAttendancesActive
                          ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                          : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                      }`}
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Registro de Asistencias</span>
                    </a>

                    <a
                      href="/admin/users"
                      class={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isUsersActive
                          ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                          : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                      }`}
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Coordinadores / Personal</span>
                    </a>
                  </div>
                </div>

                <div>
                  <div class="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 px-3">
                    Próximamente
                  </div>
                  <div class="space-y-1">
                    <div class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-neutral-600 cursor-not-allowed select-none bg-neutral-900/40">
                      <div class="flex items-center gap-3">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        <span>Padrón General</span>
                      </div>
                      <span class="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 font-medium">Pronto</span>
                    </div>

                    <div class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-neutral-600 cursor-not-allowed select-none bg-neutral-900/40">
                      <div class="flex items-center gap-3">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>Sedes y Locales</span>
                      </div>
                      <span class="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 font-medium">Pronto</span>
                    </div>

                    <div class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-neutral-600 cursor-not-allowed select-none bg-neutral-900/40">
                      <div class="flex items-center gap-3">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Auditoría de Accesos</span>
                      </div>
                      <span class="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 font-medium">Pronto</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Sidebar Footer */}
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
                  <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Cerrar Sesión</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar (Permanent) */}
        <aside class="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-neutral-900/60 backdrop-blur-xl border-r border-neutral-800/80 z-30">
          <div class="flex flex-col flex-1 min-h-0">
            {/* Header / Brand */}
            <div class="px-5 py-5 border-b border-neutral-800/80 flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <div class="text-sm font-bold text-white tracking-tight leading-none">Panel de Gestión</div>
                <div class="text-[11px] text-neutral-400 mt-1 leading-none">Sistema de Asistencia</div>
              </div>
            </div>

            {/* Navigation links */}
            <div class="flex-1 px-3 py-4 space-y-6 overflow-y-auto sidebar-scroll">
              <div>
                <div class="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 px-3">
                  Módulos Activos
                </div>
                <nav class="space-y-1">
                  {/* Eventos */}
                  <a
                    href="/admin"
                    class={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isEventsActive
                        ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                    }`}
                  >
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Eventos Presenciales</span>
                  </a>

                  {/* Asistencias */}
                  <a
                    href="/admin/attendances"
                    class={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isAttendancesActive
                        ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                    }`}
                  >
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Registro de Asistencias</span>
                  </a>

                  {/* Coordinadores */}
                  <a
                    href="/admin/users"
                    class={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isUsersActive
                        ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                    }`}
                  >
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Coordinadores / Personal</span>
                  </a>
                </nav>
              </div>

              {/* Módulos Próximamente (desactivados) */}
              <div>
                <div class="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 px-3">
                  Próximamente
                </div>
                <div class="space-y-1">
                  {/* Padrón General */}
                  <div
                    title="Módulo en desarrollo"
                    class="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-500 opacity-50 cursor-not-allowed select-none bg-neutral-900/20 border border-transparent hover:border-neutral-800/50"
                  >
                    <div class="flex items-center gap-3">
                      <svg class="w-4 h-4 flex-shrink-0 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span>Padrón General</span>
                    </div>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 font-medium">Pronto</span>
                  </div>

                  {/* Sedes y Locales */}
                  <div
                    title="Módulo en desarrollo"
                    class="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-500 opacity-50 cursor-not-allowed select-none bg-neutral-900/20 border border-transparent hover:border-neutral-800/50"
                  >
                    <div class="flex items-center gap-3">
                      <svg class="w-4 h-4 flex-shrink-0 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Sedes y Locales</span>
                    </div>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 font-medium">Pronto</span>
                  </div>

                  {/* Auditoría & Logs */}
                  <div
                    title="Módulo en desarrollo"
                    class="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-500 opacity-50 cursor-not-allowed select-none bg-neutral-900/20 border border-transparent hover:border-neutral-800/50"
                  >
                    <div class="flex items-center gap-3">
                      <svg class="w-4 h-4 flex-shrink-0 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Auditoría de Accesos</span>
                    </div>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 font-medium">Pronto</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Session Footer in Desktop Sidebar */}
            <div class="p-4 border-t border-neutral-800/80 bg-neutral-900/40">
              <div class="flex items-center justify-between mb-3">
                <div class="overflow-hidden pr-2">
                  <div class="text-xs font-semibold text-white truncate" title={user.full_name}>
                    {user.full_name}
                  </div>
                  <div class="text-[11px] text-neutral-400 font-mono mt-0.5">DNI: {user.identifier}</div>
                </div>
                <span class="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40 font-semibold text-[10px] uppercase flex-shrink-0">
                  {user.role}
                </span>
              </div>
              <form action="/logout" method="post">
                <button
                  type="submit"
                  class="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-800 border border-neutral-700/60 hover:border-neutral-600 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Cerrar Sesión</span>
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div class="flex-1 md:pl-64 flex flex-col min-h-screen">
          <main class="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-6xl w-full mx-auto">
            {children}
          </main>

          <footer class="border-t border-neutral-800/60 bg-neutral-900/30 py-4 px-6 text-center text-xs text-neutral-500">
            <div class="max-w-6xl mx-auto flex items-center justify-between">
              <span>Sistema de Control de Asistencia</span>
              <span>Modo Seguro &bull; macOS Dark UI</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
