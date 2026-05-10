import { isProd } from "./env.js";

/** Default options for the JWT auth cookie. */
export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProd,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  path: "/",
};

export const AUTH_COOKIE_NAME = "token";
