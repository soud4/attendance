import { sign, verify } from "hono/jwt";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import { getDatabase, type User } from "../db";
import {
  isJsonRequest,
  unauthorizedResponse,
  forbiddenResponse,
} from "../views/errors/error_view";

const JWT_SECRET = process.env.JWT_SECRET || "bandera-asistencia-secret-key-2026-secure";

export interface UserSession {
  id: number;
  identifier: string;
  full_name: string;
  role: "ADMIN" | "STAFF";
}

/**
 * Hash password securely with Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "argon2id",
    memoryCost: 65536,
    timeCost: 2,
  });
}

/**
 * Verify plaintext password against stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await Bun.password.verify(password, hash);
}

/**
 * Create a signed JWT session token (expires in 24 hours)
 */
export async function createSessionToken(user: UserSession): Promise<string> {
  const payload = {
    sub: user.id.toString(),
    identifier: user.identifier,
    full_name: user.full_name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  };
  return await sign(payload, JWT_SECRET, "HS256");
}

/**
 * Verify session token and return user data or null
 */
export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const payload = await verify(token, JWT_SECRET, "HS256");
    if (!payload || !payload.sub) return null;

    return {
      id: Number(payload.sub),
      identifier: payload.identifier as string,
      full_name: payload.full_name as string,
      role: payload.role as "ADMIN" | "STAFF",
    };
  } catch {
    return null;
  }
}

/**
 * Sets secure HttpOnly session cookie
 */
export function setSessionCookie(c: Context, token: string): void {
  setCookie(c, "auth_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Clears session cookie on logout
 */
export function clearSessionCookie(c: Context): void {
  deleteCookie(c, "auth_session", {
    path: "/",
  });
}

/**
 * Middleware: Protects routes and attaches user session to context
 */
export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, "auth_session");
  if (!token) {
    if (isJsonRequest(c)) {
      return unauthorizedResponse(c, "Autenticación requerida para acceder a este recurso");
    }
    return c.redirect("/login");
  }

  const user = await verifySessionToken(token);
  if (!user) {
    clearSessionCookie(c);
    if (isJsonRequest(c)) {
      return unauthorizedResponse(c, "Autenticación requerida para acceder a este recurso");
    }
    return c.redirect("/login");
  }

  // Double-check user in DB is still active
  const db = getDatabase();
  const dbUser = db
    .prepare("SELECT id, status FROM users WHERE id = $id")
    .get({ $id: user.id }) as { id: number; status: string } | null;

  if (!dbUser || dbUser.status !== "ACTIVE") {
    clearSessionCookie(c);
    if (isJsonRequest(c)) {
      return forbiddenResponse(c, "No tienes los permisos necesarios para acceder a este recurso");
    }
    return c.redirect("/login");
  }

  c.set("user", user);
  await next();
}

/**
 * Middleware: Restricts access to specified roles
 */
export function requireRole(...allowedRoles: ("ADMIN" | "STAFF")[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user") as UserSession | undefined;
    if (!user) {
      if (isJsonRequest(c)) {
        return unauthorizedResponse(c, "Autenticación requerida para acceder a este recurso");
      }
      return c.redirect("/login");
    }

    if (!allowedRoles.includes(user.role)) {
      return forbiddenResponse(c, "No tienes los permisos necesarios para acceder a este recurso");
    }

    await next();
  };
}

export const requireAdmin = requireRole("ADMIN");
