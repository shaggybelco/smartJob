import { z } from "zod";

export const APP_STATUSES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
] as const;
export const AppStatusSchema = z.enum(APP_STATUSES);
export type AppStatus = z.infer<typeof AppStatusSchema>;

export const EVENT_TYPES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "NOTE",
] as const;
export const EventTypeSchema = z.enum(EVENT_TYPES);
export type EventType = z.infer<typeof EventTypeSchema>;

// ──────────────────────────── Auth ────────────────────────────

export const RegisterInput = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(80),
});
export type RegisterInput = z.infer<typeof RegisterInput>;

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInput>;

export const PublicUser = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string(),
});
export type PublicUser = z.infer<typeof PublicUser>;

// ──────────────────────────── Application ────────────────────────────

export const ApplicationBase = z.object({
  company: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  status: AppStatusSchema.default("APPLIED"),
  source: z.string().max(80).nullish(),
  salary: z.number().int().nonnegative().nullish(),
  jobUrl: z.string().url().nullish(),
  location: z.string().max(120).nullish(),
  notes: z.string().max(5000).nullish(),
  appliedAt: z.string().datetime().optional(),
});

export const CreateApplicationInput = ApplicationBase;
export type CreateApplicationInput = z.infer<typeof CreateApplicationInput>;

export const UpdateApplicationInput = ApplicationBase.partial();
export type UpdateApplicationInput = z.infer<typeof UpdateApplicationInput>;

export const Application = ApplicationBase.extend({
  id: z.string(),
  userId: z.string(),
  appliedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Application = z.infer<typeof Application>;

export const ApplicationsListQuery = z.object({
  status: AppStatusSchema.optional(),
  q: z.string().max(120).optional(),
  sort: z.enum(["appliedAt", "company", "salary", "updatedAt"]).default("appliedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ApplicationsListQuery = z.infer<typeof ApplicationsListQuery>;

// ──────────────────────────── Event ────────────────────────────

export const CreateEventInput = z.object({
  type: EventTypeSchema,
  occurredAt: z.string().datetime().optional(),
  notes: z.string().max(5000).nullish(),
});
export type CreateEventInput = z.infer<typeof CreateEventInput>;

export const Event = z.object({
  id: z.string(),
  applicationId: z.string(),
  type: EventTypeSchema,
  occurredAt: z.string().datetime(),
  notes: z.string().nullable(),
});
export type Event = z.infer<typeof Event>;

// ──────────────────────────── Reminder ────────────────────────────

export const CreateReminderInput = z.object({
  dueAt: z.string().datetime(),
  message: z.string().min(1).max(500),
});
export type CreateReminderInput = z.infer<typeof CreateReminderInput>;

export const UpdateReminderInput = z.object({
  dueAt: z.string().datetime().optional(),
  message: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
});
export type UpdateReminderInput = z.infer<typeof UpdateReminderInput>;

export const Reminder = z.object({
  id: z.string(),
  applicationId: z.string(),
  dueAt: z.string().datetime(),
  message: z.string(),
  completed: z.boolean(),
});
export type Reminder = z.infer<typeof Reminder>;

// ──────────────────────────── Analytics ────────────────────────────

export const AnalyticsSummary = z.object({
  totals: z.object({
    applications: z.number().int(),
    interviews: z.number().int(),
    offers: z.number().int(),
    rejections: z.number().int(),
  }),
  byStatus: z.record(AppStatusSchema, z.number().int()),
  monthlyTrend: z.array(
    z.object({ month: z.string(), count: z.number().int() }),
  ),
});
export type AnalyticsSummary = z.infer<typeof AnalyticsSummary>;
