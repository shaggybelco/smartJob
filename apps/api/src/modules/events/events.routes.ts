import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { EventsController } from "./events.controller.js";

// Mounted at /api/applications/:id/events
const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get("/", EventsController.list);
router.post("/", EventsController.create);

export default router;
