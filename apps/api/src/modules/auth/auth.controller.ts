import {
  LoginInput,
  RegisterInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "@smartjob/shared";
import { asyncHandler } from "../../lib/asyncHandler.js";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  clearAuthCookieOptions,
} from "../../config/cookies.js";
import { AuthService, serializeUser } from "./auth.service.js";

export const AuthController = {
  register: asyncHandler(async (req, res) => {
    const input = RegisterInput.parse(req.body);
    const { user, token } = await AuthService.register(input);
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
    res.status(201).json(serializeUser(user));
  }),

  login: asyncHandler(async (req, res) => {
    const input = LoginInput.parse(req.body);
    const { user, token } = await AuthService.login(input);
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
    res.json(serializeUser(user));
  }),

  logout: asyncHandler(async (_req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
    res.status(204).end();
  }),

  me: asyncHandler(async (req, res) => {
    const user = await AuthService.me(req.userId!);
    res.json(serializeUser(user));
  }),

  verifyEmail: asyncHandler(async (req, res) => {
    const input = VerifyEmailInput.parse(req.body);
    await AuthService.verifyEmail(input);
    res.status(204).end();
  }),

  requestPasswordReset: asyncHandler(async (req, res) => {
    const input = RequestPasswordResetInput.parse(req.body);
    await AuthService.requestPasswordReset(input);
    res.status(204).end();
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const input = ResetPasswordInput.parse(req.body);
    await AuthService.resetPassword(input);
    res.status(204).end();
  }),
};
