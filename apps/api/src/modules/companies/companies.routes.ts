import { Router } from "express";
import { CompaniesController } from "./companies.controller.js";

const router = Router();
router.get("/:id", CompaniesController.detail);

export default router;
