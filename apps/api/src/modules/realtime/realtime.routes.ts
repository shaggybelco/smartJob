import { Router } from "express";
import type { RealtimeEvent } from "@smartjob/shared";
import { requireAuth } from "../../middleware/auth.js";
import { prisma } from "../../config/prisma.js";
import { realtime } from "./realtime.bus.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, role: true, companyId: true },
  });
  if (!user) {
    res.status(401).end();
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (event: RealtimeEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  send({ type: "ping" });

  const unsubs: Array<() => void> = [];
  unsubs.push(realtime.subscribe(`user:${user.id}`, send));
  if (user.role === "RECRUITER" && user.companyId) {
    unsubs.push(realtime.subscribe(`company:${user.companyId}`, send));
  }

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 25_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubs.forEach((u) => u());
    res.end();
  });
});

export default router;
