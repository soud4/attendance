import { getDatabase, type User } from "../db";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  type UserSession,
} from "../utils/auth";
import {
  InvalidDniError,
  ValidationError,
  InvalidCredentialsError,
  UnauthorizedError,
} from "./errors";

export class AuthService {
  /**
   * Authenticate user with DNI and password, returning signed session token & user info
   */
  public static async authenticate(
    identifier: string,
    password: string
  ): Promise<{ token: string; user: UserSession }> {
    const cleanDni = String(identifier || "").trim();

    // 1. Strict DNI Validation (8 digits)
    if (!/^\d{8}$/.test(cleanDni)) {
      throw new InvalidDniError("El DNI debe contener exactamente 8 dígitos numéricos.");
    }

    if (!password) {
      throw new ValidationError("Por favor ingresa tu contraseña.");
    }

    const db = getDatabase();
    const user = db
      .prepare("SELECT * FROM users WHERE identifier = $identifier")
      .get({ $identifier: cleanDni }) as User | null;

    if (!user || user.status !== "ACTIVE") {
      throw new InvalidCredentialsError("DNI o contraseña incorrectos.");
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      throw new InvalidCredentialsError("DNI o contraseña incorrectos.");
    }

    const userSession: UserSession = {
      id: user.id,
      identifier: user.identifier,
      full_name: user.full_name,
      role: user.role,
    };

    const token = await createSessionToken(userSession);
    return { token, user: userSession };
  }

  /**
   * Validate session token from cookie
   */
  public static async validateSession(token: string): Promise<UserSession> {
    if (!token) {
      throw new UnauthorizedError("No hay sesión activa.");
    }

    const user = await verifySessionToken(token);
    if (!user) {
      throw new UnauthorizedError("Sesión expirada o inválida.");
    }

    // Verify user is still active in database
    const db = getDatabase();
    const dbUser = db
      .prepare("SELECT id, status FROM users WHERE id = $id")
      .get({ $id: user.id }) as { id: number; status: string } | null;

    if (!dbUser || dbUser.status !== "ACTIVE") {
      throw new UnauthorizedError("El usuario ya no se encuentra activo.");
    }

    return user;
  }
}
