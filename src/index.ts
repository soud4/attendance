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
<html lang="es" class="h-full bg-slate-950">
<head>
  <meta charset="UTF-8">
  <title>Sistema de Asistencias</title>
  <link rel="stylesheet" href="/css/tailwind.css">
</head>
<body class="min-h-full flex items-center justify-center p-6 bg-slate-950 text-slate-100 font-sans">
  <div class="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-none">
    <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
      <span class="w-2 h-2 bg-emerald-500 rounded-none inline-block"></span>
      <span>Servidor Operativo</span>
    </div>
    <h1 class="text-xl font-bold text-white">Sistema de Eventos y Asistencias</h1>
    <p class="mt-2 text-xs text-slate-400 leading-relaxed">
      Para registrar asistencia a un evento específico, escanea el código QR proporcionado por el coordinador o accede mediante el enlace <code class="text-blue-300 font-mono">/asistir/[codigo]</code>.
    </p>
    <div class="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between">
      <span class="text-xs text-slate-400">¿Eres organizador?</span>
      <a href="/admin" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all">
        Acceso Panel Admin &rarr;
      </a>
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
