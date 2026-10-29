import { Hono } from "hono";
import { authMiddleware, requireAdmin, type UserSession } from "../../utils/auth";
import { UsersController } from "../../controllers/users.controller";

type Env = {
  Variables: {
    user: UserSession;
  };
};

export const adminUsersRoute = new Hono<Env>();

// Protect with session and require admin privileges
adminUsersRoute.use("*", authMiddleware, requireAdmin);

// 1. List coordinators & view form
adminUsersRoute.get("/users", UsersController.index);

// 2. Create new coordinator
adminUsersRoute.post("/users", UsersController.create);

// 3. Toggle coordinator status
adminUsersRoute.post("/users/:id/toggle", UsersController.toggle);

// 4. Delete coordinator
adminUsersRoute.post("/users/:id/delete", UsersController.delete);
