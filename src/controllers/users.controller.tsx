import type { Context } from "hono";
import { UserService } from "../services/user.service";
import { type UserSession } from "../utils/auth";
import { AdminLayout } from "../views/layouts/admin_layout";
import { UsersView } from "../views/admin/users_view";
import { AppError } from "../services/errors";

export class UsersController {
  /**
   * GET /admin/users - List coordinators and registration form
   */
  public static index(c: Context) {
    const user = c.get("user") as UserSession;
    const notice = c.req.query("notice");
    const error = c.req.query("error");
    const users = UserService.getAll();

    return c.html(
      <AdminLayout title="Gestión de Coordinadores" user={user} activePath="/admin/users">
        <UsersView users={users} noticeMessage={notice} errorMessage={error} />
      </AdminLayout>
    );
  }

  /**
   * POST /admin/users - Create new coordinator
   */
  public static async create(c: Context) {
    const user = c.get("user") as UserSession;
    const body = await c.req.parseBody();

    const identifier = String(body.identifier || "").trim();
    const fullName = String(body.full_name || "").trim();
    const password = String(body.password || "");
    const role = (String(body.role || "STAFF") as "ADMIN" | "STAFF");

    try {
      const created = await UserService.create({
        identifier,
        full_name: fullName,
        password,
        role,
      });

      return c.redirect(
        `/admin/users?notice=Coordinador+«${encodeURIComponent(created.full_name)}»+creado+exitosamente`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al registrar el usuario.";
      const statusCode = err instanceof AppError ? err.statusCode : 400;
      const users = UserService.getAll();

      return c.html(
        <AdminLayout title="Gestión de Coordinadores" user={user} activePath="/admin/users">
          <UsersView users={users} errorMessage={message} />
        </AdminLayout>,
        statusCode as any
      );
    }
  }

  /**
   * POST /admin/users/:id/toggle - Toggle user active status
   */
  public static toggle(c: Context) {
    const id = Number(c.req.param("id"));

    try {
      const { user: updated, newStatus } = UserService.toggleStatus(id);
      const statusLabel = newStatus === "ACTIVE" ? "activado" : "desactivado";
      return c.redirect(
        `/admin/users?notice=Usuario+«${encodeURIComponent(updated.full_name)}»+ha+sido+${statusLabel}`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar estado del usuario.";
      return c.redirect(`/admin/users?error=${encodeURIComponent(message)}`);
    }
  }

  /**
   * POST /admin/users/:id/delete - Delete user
   */
  public static delete(c: Context) {
    const id = Number(c.req.param("id"));

    try {
      UserService.delete(id);
      return c.redirect("/admin/users?notice=Usuario+eliminado+correctamente");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar el usuario.";
      return c.redirect(`/admin/users?error=${encodeURIComponent(message)}`);
    }
  }
}
