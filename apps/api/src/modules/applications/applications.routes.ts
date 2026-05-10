import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { ApplicationsController } from "./applications.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", ApplicationsController.list);
router.post("/", ApplicationsController.create);
router.get("/:id", ApplicationsController.detail);
router.patch("/:id", ApplicationsController.update);
router.delete("/:id", ApplicationsController.remove);

export default router;
