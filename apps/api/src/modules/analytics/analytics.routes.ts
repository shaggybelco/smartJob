import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { AnalyticsController } from "./analytics.controller.js";

const router = Router();
router.use(requireAuth);
router.get("/summary", AnalyticsController.summary);

export default router;
