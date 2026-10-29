export function renderLoginView(errorMessage?: string, prefillDni?: string): string {
  return `<!DOCTYPE html>
<html lang="es" class="h-full bg-neutral-950">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Acceso Administrativo — Asistencia</title>
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
<body class="min-h-full flex flex-col justify-between bg-neutral-950 text-slate-100 antialiased p-4 sm:p-6">

  <!-- Header Minimalista -->
  <header class="w-full max-w-md mx-auto pt-4 flex items-center justify-between text-xs text-neutral-400">
    <div class="flex items-center gap-2">
      <div class="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>
      <span class="font-semibold text-neutral-300">Asistencia</span>
    </div>
    <span class="text-[11px] font-mono text-neutral-500">Panel v1.0</span>
  </header>

  <!-- Login Card Centrada -->
  <main class="w-full max-w-md mx-auto my-auto py-8">
    
    <div class="text-center mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
        Acceso al Panel
      </h1>
      <p class="mt-1.5 text-xs sm:text-sm text-neutral-400">
        Ingresa con tu DNI y contraseña de administrador o coordinador
      </p>
    </div>

    <div class="w-full bg-neutral-900 border border-neutral-800/80 rounded-2xl shadow-xl shadow-black/40 p-6 sm:p-8">
      
      ${
        errorMessage
          ? `
        <div class="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2.5">
          <svg class="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div>
            <div class="font-semibold text-rose-100">${escapeHtml(errorMessage)}</div>
          </div>
        </div>
        `
          : ""
      }

      <form action="/login" method="POST" id="loginForm" class="space-y-4">
        
        <!-- Campo DNI -->
        <div>
          <label for="dniInput" class="block text-xs font-semibold text-neutral-300 mb-1.5">
            DNI
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
              </svg>
            </div>
            <input
              type="text"
              id="dniInput"
              name="identifier"
              required
              inputmode="numeric"
              maxlength="8"
              autocomplete="username"
              placeholder="00000000"
              value="${escapeHtml(prefillDni || "")}"
              class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white font-mono tracking-wider text-base py-3 pl-10 pr-4 placeholder:text-neutral-600 focus:bg-neutral-800 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition-all"
            />
          </div>
        </div>

        <!-- Campo Contraseña -->
        <div>
          <label for="passwordInput" class="block text-xs font-semibold text-neutral-300 mb-1.5">
            Contraseña
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <input
              type="password"
              id="passwordInput"
              name="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-base py-3 pl-10 pr-10 placeholder:text-neutral-600 focus:bg-neutral-800 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition-all"
            />
            <button
              type="button"
              id="togglePasswordBtn"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-200 cursor-pointer"
              title="Mostrar / ocultar contraseña"
            >
              <svg id="eyeIcon" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          id="submitBtn"
          class="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-lg shadow-blue-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>Ingresar al Sistema</span>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </button>

      </form>

      <div class="mt-6 pt-5 border-t border-neutral-800 text-center">
        <p class="text-[11px] text-neutral-500">
          Credenciales por defecto iniciales: DNI <span class="font-mono text-neutral-300">00000000</span> / Contraseña: <span class="font-mono text-neutral-300">admin123</span>
        </p>
      </div>

    </div>

  </main>

  <!-- Footer Minimalista -->
  <footer class="w-full max-w-md mx-auto pb-4 text-center text-xs text-neutral-600">
    <span>Sistema de Asistencia &bull; Acceso Restringido</span>
  </footer>

  <script>
    // DNI filter (numeric only)
    const dniInput = document.getElementById("dniInput");
    if (dniInput) {
      dniInput.addEventListener("input", (e) => {
        let clean = e.target.value.replace(/[^0-9]/g, "");
        if (clean.length > 8) clean = clean.slice(0, 8);
        e.target.value = clean;
      });
    }

    // Toggle password visibility
    const passwordInput = document.getElementById("passwordInput");
    const togglePasswordBtn = document.getElementById("togglePasswordBtn");
    if (togglePasswordBtn && passwordInput) {
      togglePasswordBtn.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
      });
    }
  </script>

</body>
</html>`;
}

function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
