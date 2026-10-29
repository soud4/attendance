import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { getDatabase, type User } from "../../db";
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  verifySessionToken,
} from "../../utils/auth";
import { renderLoginView } from "../../views/admin/login_view";

export const authRoute = new Hono();

// 1. Render Login View (Redirect if already authenticated)
authRoute.get("/login", async (c) => {
  const token = getCookie(c, "auth_session");
  if (token) {
    const user = await verifySessionToken(token);
    if (user) {
      return c.redirect("/admin");
    }
  }

  return c.html(renderLoginView());
});

// 2. Process Login Form Submission
authRoute.post("/login", async (c) => {
  const body = await c.req.parseBody();
  const identifier = String(body.identifier || "").trim();
  const password = String(body.password || "");

  // Strict DNI check: 8 digits
  if (!/^\d{8}$/.test(identifier)) {
    return c.html(
      renderLoginView("El DNI debe contener exactamente 8 dígitos numéricos.", identifier),
      400
    );
  }

  if (!password) {
    return c.html(
      renderLoginView("Por favor ingresa tu contraseña.", identifier),
      400
    );
  }

  const db = getDatabase();
  const user = db
    .prepare("SELECT * FROM users WHERE identifier = $identifier")
    .get({ $identifier: identifier }) as User | null;

  if (!user || user.status !== "ACTIVE") {
    return c.html(
      renderLoginView("DNI o contraseña incorrectos.", identifier),
      401
    );
  }

  // Verify password hash
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return c.html(
      renderLoginView("DNI o contraseña incorrectos.", identifier),
      401
    );
  }

  // Create session and set cookie
  const token = await createSessionToken({
    id: user.id,
    identifier: user.identifier,
    full_name: user.full_name,
    role: user.role,
  });

  setSessionCookie(c, token);
  return c.redirect("/admin");
});

// 3. Process Logout
authRoute.post("/logout", (c) => {
  clearSessionCookie(c);
  return c.redirect("/login");
});

authRoute.get("/logout", (c) => {
  clearSessionCookie(c);
  return c.redirect("/login");
});
