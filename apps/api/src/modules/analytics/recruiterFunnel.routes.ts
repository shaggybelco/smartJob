import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { RecruiterFunnelService } from "./recruiterFunnel.service.js";

const router = Router();
router.use(requireAuth, requireRole("RECRUITER"));
router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    res.json(await RecruiterFunnelService.summary(req.userId!));
  }),
);
export default router;
