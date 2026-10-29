import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { AuthService } from "../services/auth.service";
import { setSessionCookie, clearSessionCookie } from "../utils/auth";
import { LoginView } from "../views/admin/login_view";
import { AppError } from "../services/errors";

export class AuthController {
  /**
   * Render login form (redirects to /admin if already logged in)
   */
  public static async renderLogin(c: Context) {
    const token = getCookie(c, "auth_session");
    if (token) {
      try {
        await AuthService.validateSession(token);
        return c.redirect("/admin");
      } catch {
        clearSessionCookie(c);
      }
    }
    return c.html(<LoginView />);
  }

  /**
   * Process login credentials submission
   */
  public static async login(c: Context) {
    const body = await c.req.parseBody();
    const identifier = String(body.identifier || "").trim();
    const password = String(body.password || "");

    try {
      const { token } = await AuthService.authenticate(identifier, password);
      setSessionCookie(c, token);
      return c.redirect("/admin");
    } catch (err) {
      const statusCode = err instanceof AppError ? err.statusCode : 500;
      const message = err instanceof Error ? err.message : "Error inesperado de autenticación.";
      return c.html(<LoginView errorMessage={message} prefillDni={identifier} />, statusCode as any);
    }
  }

  /**
   * Process logout and clear session cookie
   */
  public static logout(c: Context) {
    clearSessionCookie(c);
    return c.redirect("/login");
  }
}
