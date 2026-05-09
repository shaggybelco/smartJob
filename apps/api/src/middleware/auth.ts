import type { RequestHandler } from "express";
import { verifyToken } from "../lib/jwt.js";
import { HttpError } from "./error.js";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.token;
  if (!token) return next(new HttpError(401, "Not authenticated"));
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
};
