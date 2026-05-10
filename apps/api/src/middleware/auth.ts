import type { RequestHandler } from "express";
import type { Role } from "@smartjob/shared";
import { verifyToken } from "../lib/jwt.js";
import { HttpError } from "./error.js";
import { prisma } from "../config/prisma.js";
import { AUTH_COOKIE_NAME } from "../config/cookies.js";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) return next(new HttpError(401, "Not authenticated"));
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
};

/**
 * Loads role from DB on each request (no stale token risk) and 403s on mismatch.
 * Use *after* requireAuth.
 */
export const requireRole = (role: Role): RequestHandler => async (req, _res, next) => {
  try {
    if (!req.userId) return next(new HttpError(401, "Not authenticated"));
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });
    if (!user) return next(new HttpError(401, "User no longer exists"));
    if (user.role !== role) return next(new HttpError(403, "Forbidden: wrong role"));
    req.userRole = user.role as Role;
    next();
  } catch (err) {
    next(err);
  }
};
