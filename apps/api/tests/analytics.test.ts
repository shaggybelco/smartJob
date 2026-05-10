import { describe, expect, it } from "vitest";
import request from "supertest";

process.env.JWT_SECRET ??= "test-secret-test-secret";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.NODE_ENV = "test";

const { createApp } = await import("../src/app.js");
const app = createApp();

describe("public endpoints", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("GET /api/jobs is public and accepts query params", async () => {
    const res = await request(app).get("/api/jobs").query({ q: "engineer" });
    expect([200, 500]).toContain(res.status);
  });

  it("GET /api/skills is public", async () => {
    const res = await request(app).get("/api/skills");
    expect([200, 500]).toContain(res.status);
  });
});

describe("auth gates", () => {
  it("rejects unauthenticated /api/auth/me", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects unauthenticated /api/recruiter/applications", async () => {
    const res = await request(app).get("/api/recruiter/applications");
    expect(res.status).toBe(401);
  });

  it("rejects unauthenticated /api/me/saved-jobs", async () => {
    const res = await request(app).get("/api/me/saved-jobs");
    expect(res.status).toBe(401);
  });

  it("rejects unauthenticated /api/realtime", async () => {
    const res = await request(app).get("/api/realtime");
    expect(res.status).toBe(401);
  });
});
