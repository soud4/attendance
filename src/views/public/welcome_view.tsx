export function WelcomeView() {
  return (
    <html lang="es" class="h-full bg-neutral-950">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Bienvenido — Control de Asistencia</title>
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
      <body class="min-h-full flex items-center justify-center p-4 sm:p-6 bg-neutral-950 text-slate-100 antialiased">
        <div class="max-w-md w-full bg-neutral-900 border border-neutral-800/80 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/50 text-center">
          {/* Icono Minimalista */}
          <div class="w-14 h-14 mx-auto mb-5 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>

          {/* Título de Bienvenida */}
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Bienvenido
          </h1>

          <p class="text-xs uppercase tracking-widest text-blue-400 font-semibold mt-1">
            Sistema de Control de Asistencia
          </p>

          {/* Mensaje Explicativo */}
          <p class="mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xs mx-auto">
            Plataforma de validación presencial y registro de asistencia para actividades y eventos oficiales.
          </p>

          {/* Indicador de Estado Discreto (Sin enlaces ni redirecciones) */}
          <div class="mt-8 pt-6 border-t border-neutral-800/80 flex items-center justify-center gap-2 text-xs text-neutral-400 font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Servicio operativo</span>
          </div>
        </div>
      </body>
    </html>
  );
}
