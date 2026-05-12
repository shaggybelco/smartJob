import { env } from "./env.js";

/**
 * The web app and API live on different domains in production (Vercel + Render),
 * so the browser refuses to send a SameSite=Lax cookie on cross-site fetches.
 * SameSite=None is required, and it in turn requires Secure.
 *
 * We key off WEB_ORIGIN rather than NODE_ENV because NODE_ENV isn't reliably
 * set on the deployed Render service, whereas WEB_ORIGIN has to be configured
 * correctly for CORS to work at all.
 */
const isHttpsOrigin = env.WEB_ORIGIN.startsWith("https://");

export const authCookieOptions = {
  httpOnly: true,
  sameSite: isHttpsOrigin ? ("none" as const) : ("lax" as const),
  secure: isHttpsOrigin,
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
