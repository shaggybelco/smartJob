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

// Sets req.userId if a valid cookie is present; otherwise treats as anonymous.
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (token) {
    try {
      const payload = verifyToken(token);
      req.userId = payload.sub;
    } catch {
      // ignore invalid token; viewer is anonymous
    }
  }
  next();
};

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

// Use after requireAuth. Allows recruiters whose membership is APPROVED or ADMIN.
export const requireApprovedRecruiter: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.userId) return next(new HttpError(401, "Not authenticated"));
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true, companyMembership: true, companyId: true },
    });
    if (!user || user.role !== "RECRUITER") return next(new HttpError(403, "Recruiter only"));
    if (!user.companyId) return next(new HttpError(403, "Recruiter has no company"));
    if (user.companyMembership === "PENDING") {
      return next(new HttpError(403, "Your account is pending company admin approval"));
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const requireCompanyAdmin: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.userId) return next(new HttpError(401, "Not authenticated"));
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true, companyMembership: true, companyId: true },
    });
    if (!user || user.role !== "RECRUITER" || !user.companyId) {
      return next(new HttpError(403, "Company admin only"));
    }
    if (user.companyMembership !== "ADMIN") {
      return next(new HttpError(403, "Company admin only"));
    }
    next();
  } catch (err) {
    next(err);
  }
};
