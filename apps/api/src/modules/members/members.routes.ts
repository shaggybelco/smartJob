import { Router } from "express";
import {
  requireAuth,
  requireCompanyAdmin,
  requireRole,
} from "../../middleware/auth.js";
import { MembersController } from "./members.controller.js";

const router = Router();
router.use(requireAuth, requireRole("RECRUITER"));

// All recruiters (including pending) may view their own company roster.
router.get("/", requireCompanyAdmin, MembersController.list);

// Admin actions
router.post("/:id/approve", requireCompanyAdmin, MembersController.approve);
router.post("/:id/promote", requireCompanyAdmin, MembersController.promote);
router.post("/:id/demote", requireCompanyAdmin, MembersController.demote);
router.delete("/:id", requireCompanyAdmin, MembersController.revoke);

export default router;
