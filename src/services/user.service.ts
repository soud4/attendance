import { getDatabase, type User } from "../db";
import { hashPassword } from "../utils/auth";
import {
  InvalidDniError,
  ValidationError,
  UserNotFoundError,
  ConflictError,
} from "./errors";
import {
  DNI_REGEX,
  SUPER_ADMIN_IDENTIFIER,
  MIN_PASSWORD_LENGTH,
  MIN_FULL_NAME_LENGTH,
} from "../config";

export interface CreateUserInput {
  identifier: string; // 8-digit DNI
  full_name: string;
  password: string;
  role?: "ADMIN" | "STAFF";
}

export interface UserPaginationOptions {
  cursor?: number | null;
  limit?: number | null;
}

export class UserService {
  /**
   * List all users ordered by creation date, supporting optional cursor pagination
   */
  public static getAll(options?: UserPaginationOptions): User[] {
    const db = getDatabase();
    let query = "SELECT id, identifier, full_name, role, status, created_at FROM users";
    const params: Record<string, any> = {};

    if (options?.cursor != null && !isNaN(options.cursor)) {
      query += " WHERE id < $cursor";
      params.$cursor = Number(options.cursor);
    }

    query += " ORDER BY id DESC";

    if (options?.limit != null && options.limit > 0) {
      query += " LIMIT $limit";
      params.$limit = Number(options.limit);
    }

    return db.prepare(query).all(params) as User[];
  }

  /**
   * Total count of users
   */
  public static getTotalCount(): number {
    const db = getDatabase();
    const res = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    return res?.count ?? 0;
  }

  /**
   * Get user by ID
   */
  public static getById(id: number): User | null {
    const db = getDatabase();
    return db
      .prepare("SELECT id, identifier, full_name, role, status, created_at FROM users WHERE id = $id")
      .get({ $id: id }) as User | null;
  }

  /**
   * Get user by 8-digit DNI
   */
  public static getByIdentifier(identifier: string): User | null {
    const db = getDatabase();
    return db
      .prepare("SELECT id, identifier, full_name, role, status, created_at FROM users WHERE identifier = $identifier")
      .get({ $identifier: identifier }) as User | null;
  }

  /**
   * Create a new user (coordinator STAFF or ADMIN)
   */
  public static async create(input: CreateUserInput): Promise<User> {
    const dni = String(input.identifier || "").trim();
    const fullName = String(input.full_name || "").trim();
    const password = String(input.password || "");
    const role = input.role || "STAFF";

    if (!DNI_REGEX.test(dni)) {
      throw new InvalidDniError("El DNI debe tener exactamente 8 dígitos numéricos.");
    }

    if (!fullName || fullName.length < MIN_FULL_NAME_LENGTH) {
      throw new ValidationError(`Por favor ingresa el nombre completo del usuario (mínimo ${MIN_FULL_NAME_LENGTH} caracteres).`);
    }

    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(`La contraseña inicial debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    }

    const existing = this.getByIdentifier(dni);
    if (existing) {
      throw new ConflictError(`Ya existe un usuario registrado con el DNI ${dni}.`);
    }

    const passwordHash = await hashPassword(password);
    const db = getDatabase();
    const now = new Date().toISOString();

    const result = db.prepare(`
      INSERT INTO users (
        identifier,
        password_hash,
        full_name,
        role,
        status,
        created_at
      ) VALUES (
        $identifier,
        $password_hash,
        $full_name,
        $role,
        'ACTIVE',
        $created_at
      )
    `).run({
      $identifier: dni,
      $password_hash: passwordHash,
      $full_name: fullName,
      $role: role,
      $created_at: now,
    });

    return this.getById(Number(result.lastInsertRowid))!;
  }

  /**
   * Toggle user active status (ACTIVE <-> INACTIVE)
   */
  public static toggleStatus(id: number): { user: User; newStatus: "ACTIVE" | "INACTIVE" } {
    const user = this.getById(id);
    if (!user) {
      throw new UserNotFoundError(String(id));
    }

    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const db = getDatabase();

    db.prepare("UPDATE users SET status = $status WHERE id = $id").run({
      $status: newStatus,
      $id: id,
    });

    const updated = this.getById(id)!;
    return { user: updated, newStatus };
  }

  /**
   * Delete a user
   */
  public static delete(id: number): boolean {
    const user = this.getById(id);
    if (!user) {
      throw new UserNotFoundError(String(id));
    }

    // Protect initial admin 00000000 from accidental deletion
    if (user.identifier === SUPER_ADMIN_IDENTIFIER) {
      throw new ValidationError("No se puede eliminar la cuenta del Administrador Principal.");
    }

    const db = getDatabase();
    db.prepare("DELETE FROM users WHERE id = $id").run({ $id: id });
    return true;
  }
}
