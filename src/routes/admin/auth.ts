import { Hono } from "hono";
import { AuthController } from "../../controllers/auth.controller";

export const authRoute = new Hono();

authRoute.get("/login", AuthController.renderLogin);
authRoute.post("/login", AuthController.login);
authRoute.post("/logout", AuthController.logout);
authRoute.get("/logout", AuthController.logout);
