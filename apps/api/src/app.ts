import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./env.js";
import { authRouter } from "./routes/auth.js";
import { applicationsRouter } from "./routes/applications.js";
import { eventsRouter } from "./routes/events.js";
import { remindersOnApplicationRouter, remindersRouter } from "./routes/reminders.js";
import { analyticsRouter } from "./routes/analytics.js";
import { errorHandler, notFound } from "./middleware/error.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  if (env.NODE_ENV !== "test") app.use(morgan(env.NODE_ENV === "development" ? "dev" : "tiny"));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/applications", applicationsRouter);
  app.use("/api/applications/:id/events", eventsRouter);
  app.use("/api/applications/:id/reminders", remindersOnApplicationRouter);
  app.use("/api/reminders", remindersRouter);
  app.use("/api/analytics", analyticsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
