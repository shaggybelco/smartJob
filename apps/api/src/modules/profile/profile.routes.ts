import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { ProfileController } from "./profile.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", ProfileController.get);
router.patch("/", ProfileController.updateBasics);
router.put("/skills", ProfileController.setSkills);
router.post("/experiences", ProfileController.addExperience);
router.patch("/experiences/:id", ProfileController.updateExperience);
router.delete("/experiences/:id", ProfileController.removeExperience);

export default router;
