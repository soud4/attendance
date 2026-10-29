import type { Context } from "hono";

export interface ErrorViewOptions {
  title?: string;
  badge?: string;
  message?: string;
  backUrl?: string;
  statusCode?: number;
}

export function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Detects whether the request expects a JSON response
 * based on headers (Accept, Content-Type) or URL prefix (/api/).
 */
export function isJsonRequest(c: Context): boolean {
  const path = c.req.path;
  if (path.startsWith("/api/")) {
    return true;
  }

  const accept = c.req.header("accept") || "";
  if (accept.includes("application/json")) {
    if (accept.includes("text/html")) {
      return accept.indexOf("application/json") < accept.indexOf("text/html");
    }
    return true;
  }

  const contentType = c.req.header("content-type") || "";
  if (contentType.includes("application/json")) {
    return true;
  }

  return false;
}

/**
 * Renders the 404 Not Found view in macOS Dark aesthetics
 */
export function renderNotFoundView(options?: { title?: string; message?: string; backUrl?: string }): string {
  const title = options?.title || "404 — Página no encontrada";
  const message =
    options?.message ||
    "El recurso solicitado no existe, ha sido movido o la dirección ingresada no es correcta.";
  const backUrl = options?.backUrl || "/";

  return `<!DOCTYPE html>
<html lang="es" class="h-full bg-neutral-950">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(title)} — Control de Asistencia</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/tailwind.css">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body class="min-h-full flex items-center justify-center p-4 sm:p-6 bg-neutral-950 text-slate-100 antialiased">
  <div class="max-w-md w-full bg-neutral-900 border border-neutral-800/80 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/50 text-center">
    
    <!-- Icono SVG Limpio -->
    <div class="w-14 h-14 mx-auto mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
      <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="12"/>
        <line x1="11" y1="14" x2="11.01" y2="14"/>
      </svg>
    </div>

    <!-- Título Principal -->
    <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
      404 — Página no encontrada
    </h1>
    
    <p class="text-xs uppercase tracking-widest text-amber-400 font-semibold mt-1">
      Recurso no disponible
    </p>

    <!-- Mensaje Explicativo -->
    <p class="mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xs mx-auto">
      ${escapeHtml(message)}
    </p>

    <!-- Botones de Navegación -->
    <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
      <a
        href="${escapeHtml(backUrl)}"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/70 text-white font-medium text-xs transition-all shadow-sm cursor-pointer"
      >
        <svg class="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <span>Volver al inicio</span>
      </a>
      <a
        href="/admin"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/20 active:scale-[0.99] transition-all cursor-pointer"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span>Panel de Gestión</span>
      </a>
    </div>

    <!-- Indicador de Estado Discreto -->
    <div class="mt-8 pt-6 border-t border-neutral-800/80 flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
      <span>Sistema de Control de Asistencia</span>
    </div>

  </div>
</body>
</html>`;
}

/**
 * Renders the 403 Forbidden / 401 Unauthorized view in macOS Dark aesthetics with SVG padlock
 */
export function renderForbiddenView(options?: ErrorViewOptions): string {
  const statusCode = options?.statusCode || 403;
  const title = options?.title || "Acceso Restringido";
  const badge =
    options?.badge ||
    (statusCode === 401 ? "Error 401 • Autenticación Requerida" : "Error 403 • Permisos Insuficientes");
  const message =
    options?.message || "No tienes los permisos necesarios para acceder a este recurso";
  const backUrl = options?.backUrl || "/";

  return `<!DOCTYPE html>
<html lang="es" class="h-full bg-neutral-950">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(title)} — Control de Asistencia</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/tailwind.css">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body class="min-h-full flex items-center justify-center p-4 sm:p-6 bg-neutral-950 text-slate-100 antialiased">
  <div class="max-w-md w-full bg-neutral-900 border border-neutral-800/80 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/50 text-center">
    
    <!-- Icono de Candado SVG Limpio -->
    <div class="w-14 h-14 mx-auto mb-5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
      <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    </div>

    <!-- Título Principal -->
    <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
      ${escapeHtml(title)}
    </h1>
    
    <p class="text-xs uppercase tracking-widest text-rose-400 font-semibold mt-1">
      ${escapeHtml(badge)}
    </p>

    <!-- Mensaje Explicativo -->
    <p class="mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xs mx-auto">
      ${escapeHtml(message)}
    </p>

    <!-- Botones de Navegación -->
    <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
      <a
        href="/login"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/20 active:scale-[0.99] transition-all cursor-pointer"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        <span>Iniciar Sesión</span>
      </a>
      <a
        href="${escapeHtml(backUrl)}"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/70 text-neutral-300 hover:text-white font-medium text-xs transition-all shadow-sm cursor-pointer"
      >
        <svg class="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <span>Volver al inicio</span>
      </a>
    </div>

    <!-- Indicador de Estado Discreto -->
    <div class="mt-8 pt-6 border-t border-neutral-800/80 flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
      <span>Sistema de Control de Asistencia</span>
    </div>

  </div>
</body>
</html>`;
}

/**
 * Renders generic 500 internal server error view in macOS Dark aesthetics
 */
export function renderInternalErrorView(options?: { message?: string; backUrl?: string }): string {
  const title = "Error del Servidor";
  const message =
    options?.message ||
    "Se ha producido un error inesperado al procesar la solicitud. Por favor intenta nuevamente más tarde.";
  const backUrl = options?.backUrl || "/";

  return `<!DOCTYPE html>
<html lang="es" class="h-full bg-neutral-950">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(title)} — Control de Asistencia</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/tailwind.css">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body class="min-h-full flex items-center justify-center p-4 sm:p-6 bg-neutral-950 text-slate-100 antialiased">
  <div class="max-w-md w-full bg-neutral-900 border border-neutral-800/80 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/50 text-center">
    
    <!-- Icono de Error SVG -->
    <div class="w-14 h-14 mx-auto mb-5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
      <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>

    <!-- Título Principal -->
    <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
      500 — Error Interno
    </h1>
    
    <p class="text-xs uppercase tracking-widest text-rose-400 font-semibold mt-1">
      Fallo del Servidor
    </p>

    <!-- Mensaje Explicativo -->
    <p class="mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xs mx-auto">
      ${escapeHtml(message)}
    </p>

    <!-- Botón de Navegación -->
    <div class="mt-8 flex items-center justify-center">
      <a
        href="${escapeHtml(backUrl)}"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/70 text-white font-medium text-xs transition-all shadow-sm cursor-pointer"
      >
        <svg class="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <span>Volver al inicio</span>
      </a>
    </div>

    <!-- Indicador de Estado Discreto -->
    <div class="mt-8 pt-6 border-t border-neutral-800/80 flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
      <span>Sistema de Control de Asistencia</span>
    </div>

  </div>
</body>
</html>`;
}

/**
 * Standard 404 handler responder for Hono
 */
export function notFoundResponse(
  c: Context,
  message = "El recurso solicitado no existe"
): Response {
  if (isJsonRequest(c)) {
    return c.json(
      {
        success: false,
        error: "Not Found",
        message,
        status: 404,
      },
      404
    );
  }

  return c.html(
    renderNotFoundView({
      message: message !== "El recurso solicitado no existe" ? message : undefined,
    }),
    404
  );
}

/**
 * Standard 403 Forbidden handler responder for Hono
 */
export function forbiddenResponse(
  c: Context,
  message = "No tienes los permisos necesarios para acceder a este recurso"
): Response {
  if (isJsonRequest(c)) {
    return c.json(
      {
        success: false,
        error: "Forbidden",
        message,
        status: 403,
      },
      403
    );
  }

  return c.html(
    renderForbiddenView({
      statusCode: 403,
      title: "Acceso Restringido",
      message,
    }),
    403
  );
}

/**
 * Standard 401 Unauthorized handler responder for Hono
 */
export function unauthorizedResponse(
  c: Context,
  message = "Autenticación requerida para acceder a este recurso"
): Response {
  if (isJsonRequest(c)) {
    return c.json(
      {
        success: false,
        error: "Unauthorized",
        message,
        status: 401,
      },
      401
    );
  }

  return c.html(
    renderForbiddenView({
      statusCode: 401,
      title: "Acceso Restringido",
      badge: "Error 401 • Autenticación Requerida",
      message,
    }),
    401
  );
}
