import { Router } from "express";
import { requireApprovedRecruiter, requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { RecruiterFunnelService } from "./recruiterFunnel.service.js";

const router = Router();
router.use(requireAuth, requireApprovedRecruiter);
router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    res.json(await RecruiterFunnelService.summary(req.userId!));
  }),
);
export default router;
