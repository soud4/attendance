import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { existsSync } from "node:fs";
import { getDatabase, initSchema } from "./db";
import { seedAdminUser, seedDemoEvent } from "./db/seed";
import { asistenciaRoute } from "./routes/asistencia";
import { authRoute } from "./routes/admin/auth";
import { adminEventsRoute } from "./routes/admin/events";

// Initialize database & schema
const db = getDatabase();
initSchema(db);

// Auto-seed if database is empty or if AUTO_SEED is requested
try {
  seedAdminUser(db);
  const eventCount = (db.query("SELECT COUNT(*) as count FROM events").get() as { count: number })?.count || 0;
  if (eventCount === 0 || process.env.AUTO_SEED === "true") {
    seedDemoEvent(db);
  }
} catch (e) {
  console.warn("No se pudo auto-sembrar datos iniciales:", e);
}

const app = new Hono();

// Middleware: Logging & Security
app.use("*", logger());
app.use(
  "*",
  secureHeaders({
    xFrameOptions: "DENY",
    xContentTypeOptions: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
  })
);

// Serve Static Assets from /public
app.use("/css/*", serveStatic({ root: "./public" }));
app.use("/js/*", serveStatic({ root: "./public" }));

// Mount Routes
app.route("/", asistenciaRoute);
app.route("/", authRoute);
app.route("/admin", adminEventsRoute);

// Root Health & Info
app.get("/", (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="es" class="h-full bg-neutral-950">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Bienvenido — Control de Asistencia</title>
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
    
    <!-- Icono Minimalista -->
    <div class="w-14 h-14 mx-auto mb-5 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
      <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    </div>

    <!-- Título de Bienvenida -->
    <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
      Bienvenido
    </h1>
    
    <p class="text-xs uppercase tracking-widest text-blue-400 font-semibold mt-1">
      Sistema de Control de Asistencia
    </p>

    <!-- Mensaje Explicativo -->
    <p class="mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xs mx-auto">
      Plataforma de validación presencial y registro de asistencia para actividades y eventos oficiales.
    </p>

    <!-- Indicador de Estado Discreto (Sin enlaces ni redirecciones) -->
    <div class="mt-8 pt-6 border-t border-neutral-800/80 flex items-center justify-center gap-2 text-xs text-neutral-400 font-medium">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span>Servicio operativo</span>
    </div>

  </div>
</body>
</html>`);
});

// Helper route in local development to download root CA for mobile phones
if (process.env.NODE_ENV !== "production") {
  const caPath = `${process.env.HOME}/.local/share/mkcert/rootCA.pem`;
  app.get("/ca.pem", (c) => {
    if (existsSync(caPath)) {
      return c.body(Bun.file(caPath).stream(), 200, {
        "Content-Type": "application/x-x509-ca-cert",
        "Content-Disposition": 'attachment; filename="rootCA.pem"',
      });
    }
    return c.text("CA no encontrada", 404);
  });
}

const PORT = Number(process.env.PORT) || 3000;

// Local TLS configuration (only enabled in development if certificates exist)
const certPath = "./localhost+1.pem";
const keyPath = "./localhost+1-key.pem";
const isLocalTls = process.env.NODE_ENV !== "production" && existsSync(certPath) && existsSync(keyPath);

const serverOptions: {
  port: number;
  fetch: typeof app.fetch;
  tls?: {
    cert: ReturnType<typeof Bun.file>;
    key: ReturnType<typeof Bun.file>;
  };
} = {
  port: PORT,
  fetch: app.fetch,
};

if (isLocalTls) {
  serverOptions.tls = {
    cert: Bun.file(certPath),
    key: Bun.file(keyPath),
  };
  console.log(`Servidor de Asistencia HTTPS (modo local) activo en:`);
  console.log(`  - Laptop:  https://localhost:${PORT}`);
  console.log(`  - Celular: https://192.168.144.81:${PORT}`);
} else {
  console.log(`Servidor de Asistencia HTTP activo en: http://localhost:${PORT}`);
}

export default serverOptions;
