import { Router } from "express";
import { SkillsController } from "./skills.controller.js";

const router = Router();
router.get("/", SkillsController.list);
export default router;
