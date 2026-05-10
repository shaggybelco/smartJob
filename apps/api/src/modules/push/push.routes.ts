import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { PushController } from "./push.controller.js";

export const pushRouter = Router();
pushRouter.get("/config", PushController.config);
pushRouter.post("/", requireAuth, PushController.register);
pushRouter.post("/unregister", requireAuth, PushController.unregister);
