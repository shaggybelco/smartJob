import { Router } from "express";
import { requireApprovedRecruiter, requireAuth } from "../../middleware/auth.js";
import { ApplicantsController } from "./applicants.controller.js";

const router = Router();
router.use(requireAuth, requireApprovedRecruiter);
router.get("/", ApplicantsController.list);
router.get("/:id", ApplicantsController.detail);
export default router;
