import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { initSchema, setDatabase } from "../src/db";
import { seedAdminUser } from "../src/db/seed";
import { createApp } from "../src/index";
import { createSessionToken } from "../src/utils/auth";
import {
  renderNotFoundView,
  renderForbiddenView,
  renderInternalErrorView,
  isJsonRequest,
} from "../src/views/errors/error_view";

describe("Global Error Handlers & Access Control (404, 401, 403, 500)", () => {
  let db: Database;
  let app: Hono;
  let adminSessionCookie: string;
  let staffSessionCookie: string;

  beforeEach(async () => {
    db = new Database(":memory:");
    db.run("PRAGMA foreign_keys = ON;");
    setDatabase(db);
    initSchema(db);
    seedAdminUser(db);

    // Create session token for Admin (00000000)
    const adminUser = db
      .prepare("SELECT * FROM users WHERE identifier = '00000000'")
      .get() as { id: number; identifier: string; full_name: string; role: "ADMIN" | "STAFF" };

    const adminToken = await createSessionToken({
      id: adminUser.id,
      identifier: adminUser.identifier,
      full_name: adminUser.full_name,
      role: adminUser.role,
    });
    adminSessionCookie = `auth_session=${adminToken}`;

    // Create Staff user and session token
    const passwordHash = await Bun.password.hash("staff123", {
      algorithm: "argon2id",
      memoryCost: 65536,
      timeCost: 2,
    });

    db.prepare(`
      INSERT INTO users (identifier, password_hash, full_name, role, status)
      VALUES ('11111111', $hash, 'Personal Staff', 'STAFF', 'ACTIVE');
    `).run({ $hash: passwordHash });

    const staffUser = db
      .prepare("SELECT * FROM users WHERE identifier = '11111111'")
      .get() as { id: number; identifier: string; full_name: string; role: "ADMIN" | "STAFF" };

    const staffToken = await createSessionToken({
      id: staffUser.id,
      identifier: staffUser.identifier,
      full_name: staffUser.full_name,
      role: staffUser.role,
    });
    staffSessionCookie = `auth_session=${staffToken}`;

    // Initialize application with global notFound and onError handlers
    app = createApp();
  });

  afterEach(() => {
    db.close();
    setDatabase(null);
  });

  describe("404 Not Found Handling", () => {
    it("should return styled 404 HTML for nonexistent route /ruta-fantasma by default", async () => {
      const res = await app.request("/ruta-fantasma");
      expect(res.status).toBe(404);
      expect(res.headers.get("content-type")).toContain("text/html");

      const html = await res.text();
      // Required text
      expect(html).toContain("404 — Página no encontrada");
      expect(html).toContain("Recurso no disponible");
      expect(html).toContain("Volver al inicio");
      expect(html).toContain("Panel de Gestión");

      // macOS Dark aesthetic
      expect(html).toContain("bg-neutral-950");
      expect(html).toContain("bg-neutral-900");
      expect(html).toContain("border-neutral-800");

      // SVG icon present
      expect(html).toContain("<svg");

      // Strict check: No emojis
      const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      expect(emojiRegex.test(html)).toBe(false);
    });

    it("should return 404 JSON when Accept: application/json is sent to /ruta-fantasma", async () => {
      const res = await app.request("/ruta-fantasma", {
        headers: { Accept: "application/json" },
      });
      expect(res.status).toBe(404);
      expect(res.headers.get("content-type")).toContain("application/json");

      const data = (await res.json()) as any;
      expect(data).toEqual({
        success: false,
        error: "Not Found",
        message: "El recurso solicitado no existe",
        status: 404,
      });
    });

    it("should return 404 JSON for non-existent /api/* routes even without Accept header", async () => {
      const res = await app.request("/api/recurso-inexistente");
      expect(res.status).toBe(404);
      expect(res.headers.get("content-type")).toContain("application/json");

      const data = (await res.json()) as any;
      expect(data).toEqual({
        success: false,
        error: "Not Found",
        message: "El recurso solicitado no existe",
        status: 404,
      });
    });
  });

  describe("401 Unauthorized Handling", () => {
    it("should redirect unauthenticated browser requests on /admin to /login", async () => {
      const res = await app.request("/admin");
      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toBe("/login");
    });

    it("should return 401 JSON for unauthenticated requests with Accept: application/json", async () => {
      const res = await app.request("/admin", {
        headers: { Accept: "application/json" },
      });
      expect(res.status).toBe(401);
      expect(res.headers.get("content-type")).toContain("application/json");

      const data = (await res.json()) as any;
      expect(data).toEqual({
        success: false,
        error: "Unauthorized",
        message: "Autenticación requerida para acceder a este recurso",
        status: 401,
      });
    });

    it("should return 401 JSON when session token is invalid or expired with Accept: application/json", async () => {
      const res = await app.request("/admin", {
        headers: {
          Cookie: "auth_session=invalid.token.here",
          Accept: "application/json",
        },
      });
      expect(res.status).toBe(401);
      const data = (await res.json()) as any;
      expect(data.error).toBe("Unauthorized");
      expect(data.status).toBe(401);
    });
  });

  describe("403 Forbidden Handling & Role Permissions", () => {
    it("should reject STAFF user trying to access admin-only event creation with 403 JSON", async () => {
      const formData = new FormData();
      formData.append("title", "Evento Bloqueado");
      formData.append("location_name", "Lugar");
      formData.append("latitude", "-12.0463");
      formData.append("longitude", "-77.0427");

      const res = await app.request("/admin/events", {
        method: "POST",
        headers: {
          Cookie: staffSessionCookie,
          Accept: "application/json",
        },
        body: formData,
      });

      expect(res.status).toBe(403);
      expect(res.headers.get("content-type")).toContain("application/json");

      const data = (await res.json()) as any;
      expect(data).toEqual({
        success: false,
        error: "Forbidden",
        message: "No tienes los permisos necesarios para acceder a este recurso",
        status: 403,
      });
    });

    it("should return styled macOS Dark 403 HTML with SVG padlock when STAFF user makes HTML request to admin action", async () => {
      const formData = new FormData();
      formData.append("title", "Evento Bloqueado");
      formData.append("location_name", "Lugar");
      formData.append("latitude", "-12.0463");
      formData.append("longitude", "-77.0427");

      const res = await app.request("/admin/events", {
        method: "POST",
        headers: {
          Cookie: staffSessionCookie,
          Accept: "text/html",
        },
        body: formData,
      });

      expect(res.status).toBe(403);
      expect(res.headers.get("content-type")).toContain("text/html");

      const html = await res.text();
      // Title and error message
      expect(html).toContain("Acceso Restringido");
      expect(html).toContain("No tienes los permisos necesarios para acceder a este recurso");
      expect(html).toContain("Error 403 • Permisos Insuficientes");

      // macOS Dark aesthetic
      expect(html).toContain("bg-neutral-950");
      expect(html).toContain("bg-neutral-900");

      // Padlock SVG icon elements
      expect(html).toContain("<svg");
      expect(html).toContain('d="M7 11V7a5 5 0 0 1 10 0v4"'); // padlock arc path
      expect(html).toContain('width="18" height="11"'); // padlock body

      // Action buttons
      expect(html).toContain("Iniciar Sesión");
      expect(html).toContain("Volver al inicio");

      // No emojis
      const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      expect(emojiRegex.test(html)).toBe(false);
    });

    it("should reject STAFF user trying to toggle event status with 403 Forbidden", async () => {
      const res = await app.request("/admin/events/1/toggle", {
        method: "POST",
        headers: {
          Cookie: staffSessionCookie,
          Accept: "application/json",
        },
      });

      expect(res.status).toBe(403);
      const data = (await res.json()) as any;
      expect(data.error).toBe("Forbidden");
    });
  });

  describe("Global app.onError Handling", () => {
    it("should handle HTTPException(403) with appropriate JSON response", async () => {
      app.get("/test-error-403", () => {
        throw new HTTPException(403, {
          message: "No tienes los permisos necesarios para acceder a este recurso",
        });
      });

      const res = await app.request("/test-error-403", {
        headers: { Accept: "application/json" },
      });

      expect(res.status).toBe(403);
      const data = (await res.json()) as any;
      expect(data).toEqual({
        success: false,
        error: "Forbidden",
        message: "No tienes los permisos necesarios para acceder a este recurso",
        status: 403,
      });
    });

    it("should handle HTTPException(403) with macOS Dark HTML template containing padlock SVG", async () => {
      app.get("/test-error-403-html", () => {
        throw new HTTPException(403, {
          message: "No tienes los permisos necesarios para acceder a este recurso",
        });
      });

      const res = await app.request("/test-error-403-html");
      expect(res.status).toBe(403);
      const html = await res.text();
      expect(html).toContain("Acceso Restringido");
      expect(html).toContain("No tienes los permisos necesarios para acceder a este recurso");
      expect(html).toContain('d="M7 11V7a5 5 0 0 1 10 0v4"');
    });

    it("should handle HTTPException(401) with appropriate JSON response", async () => {
      app.get("/test-error-401", () => {
        throw new HTTPException(401, {
          message: "Autenticación requerida para acceder a este recurso",
        });
      });

      const res = await app.request("/test-error-401", {
        headers: { Accept: "application/json" },
      });

      expect(res.status).toBe(401);
      const data = (await res.json()) as any;
      expect(data).toEqual({
        success: false,
        error: "Unauthorized",
        message: "Autenticación requerida para acceder a este recurso",
        status: 401,
      });
    });

    it("should handle unexpected 500 exceptions with clean response and no leakage", async () => {
      app.get("/test-error-500", () => {
        throw new Error("Base de datos inaccesible");
      });

      // JSON request
      const resJson = await app.request("/test-error-500", {
        headers: { Accept: "application/json" },
      });
      expect(resJson.status).toBe(500);
      const dataJson = (await resJson.json()) as any;
      expect(dataJson.error).toBe("Internal Server Error");
      expect(dataJson.message).toBe("Ocurrió un error inesperado en el servidor");

      // HTML request
      const resHtml = await app.request("/test-error-500");
      expect(resHtml.status).toBe(500);
      const html = await resHtml.text();
      expect(html).toContain("500 — Error Interno");
      expect(html).toContain("bg-neutral-950");
    });
  });

  describe("Unit Views Rendering Helpers", () => {
    it("renderNotFoundView produces valid macOS Dark markup with no emojis", () => {
      const html = renderNotFoundView();
      expect(html).toContain("404 — Página no encontrada");
      expect(html).toContain("bg-neutral-950");
      expect(html).toContain("bg-neutral-900");
      expect(html).toContain("<svg");

      const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      expect(emojiRegex.test(html)).toBe(false);
    });

    it("renderForbiddenView produces valid macOS Dark markup with SVG padlock and no emojis", () => {
      const html = renderForbiddenView({
        title: "Acceso Restringido",
        message: "No tienes los permisos necesarios para acceder a este recurso",
      });
      expect(html).toContain("Acceso Restringido");
      expect(html).toContain("No tienes los permisos necesarios para acceder a este recurso");
      expect(html).toContain('d="M7 11V7a5 5 0 0 1 10 0v4"');
      expect(html).toContain("bg-neutral-950");

      const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      expect(emojiRegex.test(html)).toBe(false);
    });

    it("renderInternalErrorView produces valid markup", () => {
      const html = renderInternalErrorView();
      expect(html).toContain("500 — Error Interno");
      expect(html).toContain("bg-neutral-950");
    });
  });
});
