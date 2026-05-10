import { RegisterPushSubscriptionInput } from "@smartjob/shared";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { env } from "../../config/env.js";
import { PushService } from "./push.service.js";

export const PushController = {
  config: asyncHandler(async (_req, res) => {
    res.json({ vapidPublicKey: env.VAPID_PUBLIC_KEY ?? null });
  }),

  register: asyncHandler(async (req, res) => {
    const input = RegisterPushSubscriptionInput.parse(req.body);
    await PushService.register(req.userId!, input);
    res.status(204).end();
  }),

  unregister: asyncHandler(async (req, res) => {
    const endpoint = String(req.body?.endpoint ?? "");
    await PushService.unregister(req.userId!, endpoint);
    res.status(204).end();
  }),
};
