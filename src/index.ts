import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { getDatabase, initSchema } from "./db";
import { seedDemoEvent } from "./db/seed";
import { asistenciaRoute } from "./routes/asistencia";

// Initialize database & schema
const db = getDatabase();
initSchema(db);

// Auto-seed if database is empty or if AUTO_SEED is requested
try {
  const eventCount = (db.query("SELECT COUNT(*) as count FROM events").get() as { count: number })?.count || 0;
  if (eventCount === 0 || process.env.AUTO_SEED === "true") {
    seedDemoEvent(db);
  }
} catch (e) {
  console.warn("No se pudo auto-sembrar evento inicial:", e);
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
  </div>
</body>
</html>`);
});

const PORT = Number(process.env.PORT) || 3000;

console.log(`Servidor de Asistencia ejecutándose en: http://localhost:${PORT}`);

export default {
  port: PORT,
  fetch: app.fetch,
};
