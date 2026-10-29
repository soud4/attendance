import { Hono } from "hono";
import { authMiddleware, requireAdmin, type UserSession } from "../../utils/auth";
import { EventsController } from "../../controllers/events.controller";

type Env = {
  Variables: {
    user: UserSession;
  };
};

export const adminEventsRoute = new Hono<Env>();

// Apply auth protection to all /admin routes
adminEventsRoute.use("*", authMiddleware);

// 1. Dashboard: List Events
adminEventsRoute.get("/", EventsController.index);

// 2. New Event Form View
adminEventsRoute.get("/events/new", requireAdmin, EventsController.renderCreate);

// 3. Create Event Handler (Admin only)
adminEventsRoute.post("/events", requireAdmin, EventsController.create);

// 4. View Event Details & Attendee List
adminEventsRoute.get("/events/:id", EventsController.show);

// 5. Edit Event Form View (Admin only)
adminEventsRoute.get("/events/:id/edit", requireAdmin, EventsController.renderEdit);

// 6. Update Event Handler (Admin only)
adminEventsRoute.post("/events/:id/edit", requireAdmin, EventsController.update);

// 7. Delete Event Handler (Admin only)
adminEventsRoute.post("/events/:id/delete", requireAdmin, EventsController.delete);

// 8. Toggle Event Status (Admin only)
adminEventsRoute.post("/events/:id/toggle", requireAdmin, EventsController.toggle);
