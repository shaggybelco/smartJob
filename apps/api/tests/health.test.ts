import { describe, it, expect } from "vitest";
import request from "supertest";

process.env.JWT_SECRET ??= "test-secret-test-secret";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.NODE_ENV = "test";

const { createApp } = await import("../src/app.js");
const app = createApp();

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe("auth", () => {
  it("rejects unauthenticated requests to /me", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
