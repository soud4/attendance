import { Hono } from "hono";
import { AttendanceController } from "../controllers/attendance.controller";

export const asistenciaRoute = new Hono();

// 1. Directory lookup by DNI (Must be registered before /asistir/:code)
asistenciaRoute.get("/asistir/lookup/:dni", AttendanceController.lookupDni);

// 2. Render Public Form View
asistenciaRoute.get("/asistir/:code", AttendanceController.renderForm);

// 3. Quick JSON Status Check
asistenciaRoute.get("/asistir/:code/status", AttendanceController.status);

// 4. Process Public Attendance POST with GPS & Radius Verification
asistenciaRoute.post("/asistir/:code", AttendanceController.register);
