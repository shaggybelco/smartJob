export const openApiDoc = {
  openapi: "3.0.3",
  info: {
    title: "Smart Job API",
    version: "1.0.0",
    description:
      "Two-sided job platform: applicants apply through the public board, recruiters manage hiring pipelines.",
  },
  servers: [{ url: "/api" }],
  tags: [
    { name: "Auth" },
    { name: "Jobs (public)" },
    { name: "Applications (applicant)" },
    { name: "Job Applications (recruiter)" },
    { name: "Recruiter analytics" },
    { name: "Saved jobs" },
    { name: "Skills" },
    { name: "Companies" },
    { name: "Realtime" },
    { name: "Resumes" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
    },
  },
  paths: {
    "/health": {
      get: { tags: ["Auth"], summary: "Health check", responses: { "200": { description: "OK" } } },
    },
    "/auth/register": {
      post: { tags: ["Auth"], summary: "Register a new applicant or recruiter", responses: { "201": { description: "Created" }, "409": { description: "Email taken" } } },
    },
    "/auth/login": {
      post: { tags: ["Auth"], summary: "Sign in", responses: { "200": { description: "OK" }, "401": { description: "Invalid credentials" } } },
    },
    "/auth/logout": { post: { tags: ["Auth"], summary: "Sign out", responses: { "204": { description: "OK" } } } },
    "/auth/me": { get: { tags: ["Auth"], security: [{ cookieAuth: [] }], summary: "Current user", responses: { "200": { description: "OK" }, "401": { description: "Unauthenticated" } } } },
    "/auth/verify-email": { post: { tags: ["Auth"], summary: "Verify email with token", responses: { "204": { description: "OK" }, "400": { description: "Invalid token" } } } },
    "/auth/request-password-reset": { post: { tags: ["Auth"], summary: "Request a password-reset email", responses: { "204": { description: "OK" } } } },
    "/auth/reset-password": { post: { tags: ["Auth"], summary: "Set a new password using a reset token", responses: { "204": { description: "OK" }, "400": { description: "Token invalid or expired" } } } },

    "/jobs": {
      get: { tags: ["Jobs (public)"], summary: "List open jobs", parameters: [
        { name: "q", in: "query", schema: { type: "string" } },
        { name: "location", in: "query", schema: { type: "string" } },
        { name: "remote", in: "query", schema: { type: "boolean" } },
        { name: "salaryMin", in: "query", schema: { type: "integer" } },
        { name: "salaryMax", in: "query", schema: { type: "integer" } },
        { name: "skill", in: "query", schema: { type: "string" } },
      ], responses: { "200": { description: "OK" } } },
      post: { tags: ["Job Applications (recruiter)"], security: [{ cookieAuth: [] }], summary: "Recruiter posts a job", responses: { "201": { description: "Created" } } },
    },
    "/jobs/{id}": {
      get: { tags: ["Jobs (public)"], summary: "Job detail", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" }, "404": { description: "Not found" } } },
      patch: { tags: ["Job Applications (recruiter)"], security: [{ cookieAuth: [] }], summary: "Update a job", responses: { "200": { description: "OK" } } },
      delete: { tags: ["Job Applications (recruiter)"], security: [{ cookieAuth: [] }], summary: "Delete a job", responses: { "204": { description: "OK" } } },
    },
    "/jobs/{id}/close": { patch: { tags: ["Job Applications (recruiter)"], security: [{ cookieAuth: [] }], summary: "Close a job", responses: { "200": { description: "OK" } } } },
    "/jobs/{id}/applications": { get: { tags: ["Job Applications (recruiter)"], security: [{ cookieAuth: [] }], summary: "List applicants for a job", responses: { "200": { description: "OK" } } } },
    "/jobs/{id}/apply": { post: { tags: ["Applications (applicant)"], security: [{ cookieAuth: [] }], summary: "Apply with cover letter / CV (multipart)", responses: { "201": { description: "Created" }, "409": { description: "Already applied" } } } },

    "/recruiter/jobs": { get: { tags: ["Job Applications (recruiter)"], security: [{ cookieAuth: [] }], summary: "List my company jobs", responses: { "200": { description: "OK" } } } },
    "/recruiter/applications": { get: { tags: ["Job Applications (recruiter)"], security: [{ cookieAuth: [] }], summary: "Cross-job applicant inbox", responses: { "200": { description: "OK" } } } },
    "/recruiter/analytics/summary": { get: { tags: ["Recruiter analytics"], security: [{ cookieAuth: [] }], summary: "Hiring funnel + monthly trend", responses: { "200": { description: "OK" } } } },

    "/job-applications/{id}": {
      get: { tags: ["Job Applications (recruiter)"], security: [{ cookieAuth: [] }], summary: "Application detail", responses: { "200": { description: "OK" } } },
      patch: { tags: ["Job Applications (recruiter)"], security: [{ cookieAuth: [] }], summary: "Update status / recruiter note (mirrors to applicant tracker)", responses: { "200": { description: "OK" } } },
    },
    "/job-applications/bulk": { post: { tags: ["Job Applications (recruiter)"], security: [{ cookieAuth: [] }], summary: "Bulk update status across many applications", responses: { "200": { description: "OK" } } } },

    "/me/job-applications": { get: { tags: ["Applications (applicant)"], security: [{ cookieAuth: [] }], summary: "My in-platform applications (no recruiter notes)", responses: { "200": { description: "OK" } } } },
    "/me/job-applications/{id}/withdraw": { post: { tags: ["Applications (applicant)"], security: [{ cookieAuth: [] }], summary: "Withdraw an application", responses: { "204": { description: "OK" } } } },
    "/me/saved-jobs": { get: { tags: ["Saved jobs"], security: [{ cookieAuth: [] }], summary: "List my saved jobs", responses: { "200": { description: "OK" } } } },
    "/me/saved-jobs/ids": { get: { tags: ["Saved jobs"], security: [{ cookieAuth: [] }], summary: "Just the saved job ids", responses: { "200": { description: "OK" } } } },
    "/me/saved-jobs/{id}": {
      put: { tags: ["Saved jobs"], security: [{ cookieAuth: [] }], summary: "Save a job", responses: { "204": { description: "OK" } } },
      delete: { tags: ["Saved jobs"], security: [{ cookieAuth: [] }], summary: "Unsave a job", responses: { "204": { description: "OK" } } },
    },

    "/skills": { get: { tags: ["Skills"], summary: "Skill suggestions", responses: { "200": { description: "OK" } } } },
    "/companies/{id}": { get: { tags: ["Companies"], summary: "Public company profile + open roles", responses: { "200": { description: "OK" } } } },
    "/resumes/{id}": { get: { tags: ["Resumes"], security: [{ cookieAuth: [] }], summary: "Stream a resume file (recruiter at owning company or the applicant)", responses: { "200": { description: "OK" } } } },
    "/realtime": { get: { tags: ["Realtime"], security: [{ cookieAuth: [] }], summary: "Server-Sent Events stream of pipeline updates", responses: { "200": { description: "text/event-stream" } } } },
  },
} as const;
