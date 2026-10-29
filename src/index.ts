import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { existsSync } from "node:fs";
import { getDatabase, initSchema } from "./db";
import { seedAdminUser, seedDemoEvent } from "./db/seed";
import { asistenciaRoute } from "./routes/asistencia";
import { authRoute } from "./routes/admin/auth";
import { adminEventsRoute } from "./routes/admin/events";
import { adminUsersRoute } from "./routes/admin/users";
import { adminAttendancesRoute } from "./routes/admin/attendances";
import { geoRoute } from "./routes/api/geo";
import {
  notFoundResponse,
  forbiddenResponse,
  unauthorizedResponse,
  renderInternalErrorView,
  isJsonRequest,
} from "./views/errors/error_view";
import { WelcomeView } from "./views/public/welcome_view";
import { env } from "./config/env";

// Initialize database & schema
const db = getDatabase();
initSchema(db);

// Auto-seed if database is empty or if AUTO_SEED is requested
try {
  seedAdminUser(db);
  const eventCount = (db.query("SELECT COUNT(*) as count FROM events").get() as { count: number })?.count || 0;
  if (eventCount === 0 || env.AUTO_SEED) {
    seedDemoEvent(db);
  }
} catch (e) {
  console.warn("No se pudo auto-sembrar datos iniciales:", e);
}

export function createApp(): Hono {
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
  app.route("/admin", adminUsersRoute);
  app.route("/admin", adminAttendancesRoute);
  app.route("/api/geo", geoRoute);

  // Root Health & Info
  app.get("/", (c) => {
    return c.html(WelcomeView());
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

  // Global Error Handler (app.onError)
  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      if (err.status === 401) {
        return unauthorizedResponse(c, err.message);
      }
      if (err.status === 403) {
        return forbiddenResponse(c, err.message);
      }
      if (err.status === 404) {
        return notFoundResponse(c, err.message);
      }
      if (isJsonRequest(c)) {
        return c.json(
          {
            success: false,
            error: err.name || "Error",
            message: err.message,
            status: err.status,
          },
          err.status
        );
      }
      return err.getResponse();
    }

    console.error("Unhandled server error:", err);
    if (isJsonRequest(c)) {
      return c.json(
        {
          success: false,
          error: "Internal Server Error",
          message: "Ocurrió un error inesperado en el servidor",
          status: 500,
        },
        500
      );
    }
    return c.html(renderInternalErrorView(), 500);
  });

  // Global 404 Handler (app.notFound)
  app.notFound((c) => {
    return notFoundResponse(c);
  });

  return app;
}

export const app = createApp();

const PORT = env.PORT;

// Local TLS configuration (only enabled in development if certificates exist)
const certPath = "./localhost+1.pem";
const keyPath = "./localhost+1-key.pem";
const isLocalTls = env.NODE_ENV !== "production" && existsSync(certPath) && existsSync(keyPath);

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
