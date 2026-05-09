import { Router } from "express";
import { LoginInput, RegisterInput } from "@smartjob/shared";
import { prisma } from "../db.js";
import { signToken } from "../lib/jwt.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { isProd } from "../env.js";

export const authRouter = Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProd,
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: "/",
};

authRouter.post("/register", async (req, res, next) => {
  try {
    const input = RegisterInput.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new HttpError(409, "Email already registered");

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: { email: input.email, name: input.name, passwordHash },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const token = signToken({ sub: user.id, email: user.email });
    res.cookie("token", token, cookieOptions);
    res.status(201).json({ ...user, createdAt: user.createdAt.toISOString() });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const input = LoginInput.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    const token = signToken({ sub: user.id, email: user.email });
    res.cookie("token", token, cookieOptions);
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token", { path: "/" });
  res.status(204).end();
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) throw new HttpError(401, "User no longer exists");
    res.json({ ...user, createdAt: user.createdAt.toISOString() });
  } catch (err) {
    next(err);
  }
});
