import { Hono } from "hono";
import { authMiddleware, type UserSession } from "../../utils/auth";
import { AttendancesAdminController } from "../../controllers/attendances_admin.controller";

type Env = {
  Variables: {
    user: UserSession;
  };
};

export const adminAttendancesRoute = new Hono<Env>();

// Apply auth protection
adminAttendancesRoute.use("*", authMiddleware);

// 1. List all attendances
adminAttendancesRoute.get("/attendances", AttendancesAdminController.index);

// 2. Export attendances as CSV
adminAttendancesRoute.get("/attendances/export", AttendancesAdminController.exportCsv);
