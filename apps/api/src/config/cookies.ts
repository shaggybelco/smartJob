import { isProd } from "./env.js";

/**
 * Default options for the JWT auth cookie.
 *
 * In production the web app and API are on different domains (Vercel + Render),
 * so the browser will not send a SameSite=Lax cookie on cross-site fetches.
 * SameSite=None is required for that, and it in turn requires Secure.
 */
export const authCookieOptions = {
  httpOnly: true,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  secure: isProd,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  path: "/",
};

export const clearAuthCookieOptions = {
  httpOnly: true,
  sameSite: authCookieOptions.sameSite,
  secure: authCookieOptions.secure,
  path: "/",
};

export const AUTH_COOKIE_NAME = "token";
