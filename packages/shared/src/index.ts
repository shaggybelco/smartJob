import { z } from "zod";

export const APP_STATUSES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;
export const AppStatusSchema = z.enum(APP_STATUSES);
export type AppStatus = z.infer<typeof AppStatusSchema>;

export const PIPELINE_STATUSES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "REJECTED"] as const;
export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

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

export const ROLES = ["APPLICANT", "RECRUITER"] as const;
export const RoleSchema = z.enum(ROLES);
export type Role = z.infer<typeof RoleSchema>;

export const COMPANY_MEMBERSHIPS = ["PENDING", "APPROVED", "ADMIN"] as const;
export const CompanyMembershipSchema = z.enum(COMPANY_MEMBERSHIPS);
export type CompanyMembership = z.infer<typeof CompanyMembershipSchema>;

export const JOB_STATUSES = ["OPEN", "CLOSED"] as const;
export const JobStatusSchema = z.enum(JOB_STATUSES);
export type JobStatus = z.infer<typeof JobStatusSchema>;

// Auth

export const RegisterInput = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
    name: z.string().min(1).max(80),
    role: RoleSchema.default("APPLICANT"),
    companyId: z.string().min(1).optional(),
    companyName: z.string().min(1).max(120).optional(),
  })
  .refine(
    (v) =>
      v.role !== "RECRUITER" ||
      !!v.companyId ||
      (!!v.companyName && v.companyName.trim().length > 0),
    {
      message: "Recruiters must select an existing company or provide a new company name",
      path: ["companyName"],
    },
  );
export type RegisterInput = z.infer<typeof RegisterInput>;

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInput>;

export const RequestPasswordResetInput = z.object({
  email: z.string().email(),
});
export type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetInput>;

export const ResetPasswordInput = z.object({
  token: z.string().min(8),
  password: z.string().min(8).max(100),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordInput>;

export const VerifyEmailInput = z.object({
  token: z.string().min(8),
});
export type VerifyEmailInput = z.infer<typeof VerifyEmailInput>;

export const PublicCompany = z.object({
  id: z.string(),
  name: z.string(),
  website: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});
export type PublicCompany = z.infer<typeof PublicCompany>;

export const PublicUser = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: RoleSchema,
  emailVerified: z.boolean().optional(),
  company: PublicCompany.nullable().optional(),
  companyMembership: CompanyMembershipSchema.nullable().optional(),
  createdAt: z.string(),
});
export type PublicUser = z.infer<typeof PublicUser>;

export const CompanyMember = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  membership: CompanyMembershipSchema,
  createdAt: z.string(),
});
export type CompanyMember = z.infer<typeof CompanyMember>;

// Application (personal tracker)

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
  jobApplicationId: z.string().nullable().optional(),
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

// Event

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

// Reminder

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

// Analytics

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

export const RecruiterFunnelSummary = z.object({
  totals: z.object({
    jobs: z.number().int(),
    openJobs: z.number().int(),
    applications: z.number().int(),
    offers: z.number().int(),
  }),
  byStatus: z.record(AppStatusSchema, z.number().int()),
  conversion: z.object({
    appliedToScreening: z.number(),
    screeningToInterview: z.number(),
    interviewToOffer: z.number(),
  }),
  medianDaysToOffer: z.number().nullable(),
  monthlyTrend: z.array(z.object({ month: z.string(), applications: z.number().int(), offers: z.number().int() })),
});
export type RecruiterFunnelSummary = z.infer<typeof RecruiterFunnelSummary>;

// Skills

export const Skill = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});
export type Skill = z.infer<typeof Skill>;

// Job

export const JobBase = z.object({
  title: z.string().min(1).max(160),
  description: z.string().min(1).max(20000),
  location: z.string().max(120).nullish(),
  remote: z.boolean().optional(),
  salaryMin: z.number().int().nonnegative().nullish(),
  salaryMax: z.number().int().nonnegative().nullish(),
});

export const JobQuestionInput = z.object({
  prompt: z.string().min(1).max(500),
  required: z.boolean().default(false),
  position: z.number().int().nonnegative().default(0),
});
export type JobQuestionInput = z.infer<typeof JobQuestionInput>;

export const JobQuestion = JobQuestionInput.extend({
  id: z.string(),
  jobId: z.string(),
});
export type JobQuestion = z.infer<typeof JobQuestion>;

export const CreateJobInput = JobBase.extend({
  skills: z.array(z.string().min(1).max(40)).max(20).optional(),
  questions: z.array(JobQuestionInput).max(10).optional(),
});
export type CreateJobInput = z.infer<typeof CreateJobInput>;

export const UpdateJobInput = JobBase.partial().extend({
  status: JobStatusSchema.optional(),
  skills: z.array(z.string().min(1).max(40)).max(20).optional(),
  questions: z.array(JobQuestionInput).max(10).optional(),
});
export type UpdateJobInput = z.infer<typeof UpdateJobInput>;

export const Job = JobBase.extend({
  id: z.string(),
  companyId: z.string(),
  postedById: z.string(),
  status: JobStatusSchema,
  remote: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Job = z.infer<typeof Job>;

export const JobWithCompany = Job.extend({
  company: PublicCompany,
  skills: z.array(Skill).optional(),
  questions: z.array(JobQuestion).optional(),
});
export type JobWithCompany = z.infer<typeof JobWithCompany>;

export const JobsListQuery = z.object({
  q: z.string().max(120).optional(),
  location: z.string().max(120).optional(),
  status: JobStatusSchema.optional(),
  remote: z.coerce.boolean().optional(),
  salaryMin: z.coerce.number().int().nonnegative().optional(),
  salaryMax: z.coerce.number().int().nonnegative().optional(),
  skill: z.string().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type JobsListQuery = z.infer<typeof JobsListQuery>;

// JobApplication (in-platform)

export const ApplyToJobInput = z.object({
  coverLetter: z.string().max(20000).optional().or(z.literal("")),
  resumeUrl: z.string().url().nullish().or(z.literal("")),
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        answer: z.string().max(5000),
      }),
    )
    .optional(),
});
export type ApplyToJobInput = z.infer<typeof ApplyToJobInput>;

export const UpdateJobApplicationInput = z.object({
  status: AppStatusSchema.optional(),
  recruiterNote: z.string().max(5000).nullish(),
});
export type UpdateJobApplicationInput = z.infer<typeof UpdateJobApplicationInput>;

export const BulkUpdateJobApplicationsInput = z.object({
  ids: z.array(z.string()).min(1).max(200),
  status: AppStatusSchema,
});
export type BulkUpdateJobApplicationsInput = z.infer<typeof BulkUpdateJobApplicationsInput>;

export const PublicApplicant = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});
export type PublicApplicant = z.infer<typeof PublicApplicant>;

export const ApplicationAnswer = z.object({
  id: z.string(),
  questionId: z.string(),
  answer: z.string(),
  question: z
    .object({
      id: z.string(),
      prompt: z.string(),
    })
    .optional(),
});
export type ApplicationAnswer = z.infer<typeof ApplicationAnswer>;

export const JobApplication = z.object({
  id: z.string(),
  jobId: z.string(),
  applicantId: z.string(),
  coverLetter: z.string().nullable().optional(),
  resumeUrl: z.string().nullable().optional(),
  resumeStorageKey: z.string().nullable().optional(),
  resumeFilename: z.string().nullable().optional(),
  resumeMimeType: z.string().nullable().optional(),
  resumeSize: z.number().int().nullable().optional(),
  status: AppStatusSchema,
  recruiterNote: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  answers: z.array(ApplicationAnswer).optional(),
});
export type JobApplication = z.infer<typeof JobApplication>;

export const JobApplicationWithJob = JobApplication.extend({
  job: JobWithCompany,
});
export type JobApplicationWithJob = z.infer<typeof JobApplicationWithJob>;

export const JobApplicationWithApplicant = JobApplication.extend({
  applicant: PublicApplicant,
});
export type JobApplicationWithApplicant = z.infer<typeof JobApplicationWithApplicant>;

// Saved jobs

export const SavedJob = z.object({
  jobId: z.string(),
  savedAt: z.string().datetime(),
  job: JobWithCompany,
});
export type SavedJob = z.infer<typeof SavedJob>;

// Realtime SSE event payloads

export const RealtimeEvent = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("application.status"),
    jobApplicationId: z.string(),
    jobId: z.string(),
    applicantId: z.string(),
    status: AppStatusSchema,
  }),
  z.object({
    type: z.literal("application.created"),
    jobApplicationId: z.string(),
    jobId: z.string(),
  }),
  z.object({ type: z.literal("ping") }),
]);
export type RealtimeEvent = z.infer<typeof RealtimeEvent>;
