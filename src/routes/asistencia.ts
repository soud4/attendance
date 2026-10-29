import { Hono } from "hono";
import { AttendanceController } from "../controllers/attendance.controller";

export const asistenciaRoute = new Hono();

// 1. Render Public Form View
asistenciaRoute.get("/asistir/:code", AttendanceController.renderForm);

// 2. Quick JSON Status Check
asistenciaRoute.get("/asistir/:code/status", AttendanceController.status);

// 3. Process Public Attendance POST with GPS & Radius Verification
asistenciaRoute.post("/asistir/:code", AttendanceController.register);
