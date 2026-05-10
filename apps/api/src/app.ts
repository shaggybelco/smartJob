import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import authRouter from "./modules/auth/auth.routes.js";
import applicationsRouter from "./modules/applications/applications.routes.js";
import eventsRouter from "./modules/events/events.routes.js";
import {
  remindersOnApplicationRouter,
  remindersRouter,
} from "./modules/reminders/reminders.routes.js";
import analyticsRouter from "./modules/analytics/analytics.routes.js";
import recruiterAnalyticsRouter from "./modules/analytics/recruiterFunnel.routes.js";
import { jobsRouter, recruiterJobsRouter } from "./modules/jobs/jobs.routes.js";
import {
  jobApplicationsRouter,
  myJobApplicationsRouter,
  recruiterApplicationsRouter,
} from "./modules/jobApplications/jobApplications.routes.js";
import companiesRouter from "./modules/companies/companies.routes.js";
import resumesRouter from "./modules/resumes/resumes.routes.js";
import skillsRouter from "./modules/skills/skills.routes.js";
import { savedJobsRouter } from "./modules/savedJobs/savedJobs.routes.js";
import realtimeRouter from "./modules/realtime/realtime.routes.js";
import membersRouter from "./modules/members/members.routes.js";
import docsRouter from "./modules/docs/docs.routes.js";
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
  app.use("/api/recruiter/analytics", recruiterAnalyticsRouter);
  app.use("/api/recruiter/members", membersRouter);
  app.use("/api/jobs", jobsRouter);
  app.use("/api/recruiter/jobs", recruiterJobsRouter);
  app.use("/api/recruiter/applications", recruiterApplicationsRouter);
  app.use("/api/job-applications", jobApplicationsRouter);
  app.use("/api/me/job-applications", myJobApplicationsRouter);
  app.use("/api/me/saved-jobs", savedJobsRouter);
  app.use("/api/companies", companiesRouter);
  app.use("/api/resumes", resumesRouter);
  app.use("/api/skills", skillsRouter);
  app.use("/api/realtime", realtimeRouter);
  app.use("/api/docs", docsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
