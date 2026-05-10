import { randomBytes } from "node:crypto";
import type {
  LoginInput,
  RegisterInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "@smartjob/shared";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { signToken } from "../../lib/jwt.js";
import { sendMail } from "../../lib/email.js";
import { env } from "../../config/env.js";
import { HttpError } from "../../middleware/error.js";
import {
  CompanyRepository,
  UserRepository,
  type UserPublic,
} from "./auth.repository.js";

const issueToken = (user: UserPublic) =>
  signToken({ sub: user.id, email: user.email });

const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

const verifyUrl = (token: string) =>
  `${env.WEB_ORIGIN}/verify-email?token=${encodeURIComponent(token)}`;

const resetUrl = (token: string) =>
  `${env.WEB_ORIGIN}/reset-password?token=${encodeURIComponent(token)}`;

export const AuthService = {
  async register(input: RegisterInput): Promise<{ user: UserPublic; token: string }> {
    if (await UserRepository.findByEmail(input.email)) {
      throw new HttpError(409, "Email already registered");
    }

    const passwordHash = await hashPassword(input.password);
    const verificationToken = randomToken();

    let companyId: string | undefined;
    let membership: "PENDING" | "ADMIN" | undefined;

    if (input.role === "RECRUITER") {
      if (input.companyId) {
        const existing = await CompanyRepository.findById(input.companyId);
        if (!existing) throw new HttpError(404, "Selected company not found");
        companyId = existing.id;
        membership = "PENDING";
      } else {
        const trimmed = input.companyName!.trim();
        const existing = await CompanyRepository.findByName(trimmed);
        if (existing) {
          companyId = existing.id;
          membership = "PENDING";
        } else {
          const created = await CompanyRepository.create(trimmed);
          companyId = created.id;
          membership = "ADMIN";
        }
      }
    }

    const user = await UserRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
      companyId,
      companyMembership: membership,
      emailVerificationToken: verificationToken,
    });

    void sendMail({
      to: user.email,
      subject: "Confirm your Smart Job account",
      text: `Hi ${user.name},\n\nClick the link below to confirm your email:\n${verifyUrl(verificationToken)}\n`,
    }).catch((err) => console.error("[auth] verification email failed", err));

    return { user, token: issueToken(user) };
  },

  async login(input: LoginInput): Promise<{ user: UserPublic; token: string }> {
    const found = await UserRepository.findByEmailWithHash(input.email);
    if (!found) throw new HttpError(401, "Invalid credentials");

    const ok = await verifyPassword(input.password, found.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    const { passwordHash: _ph, ...user } = found;
    return { user, token: issueToken(user) };
  },

  async me(userId: string): Promise<UserPublic> {
    const user = await UserRepository.findPublicById(userId);
    if (!user) throw new HttpError(401, "User no longer exists");
    return user;
  },

  async verifyEmail(input: VerifyEmailInput) {
    const found = await UserRepository.findByVerificationToken(input.token);
    if (!found) throw new HttpError(400, "Invalid or expired verification link");
    await UserRepository.setVerified(found.id);
  },

  async requestPasswordReset(input: RequestPasswordResetInput) {
    const user = await UserRepository.findByEmail(input.email);
    if (!user) return;
    const token = randomToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    await UserRepository.setResetToken(user.id, token, expiresAt);

    void sendMail({
      to: user.email,
      subject: "Reset your Smart Job password",
      text: `Hi ${user.name},\n\nReset your password using the link below (valid for 1 hour):\n${resetUrl(token)}\n\nIf you didn't request this, ignore this email.`,
    }).catch((err) => console.error("[auth] reset email failed", err));
  },

  async resetPassword(input: ResetPasswordInput) {
    const found = await UserRepository.findByResetToken(input.token);
    if (!found || !found.passwordResetExpiresAt || found.passwordResetExpiresAt < new Date()) {
      throw new HttpError(400, "Reset link is invalid or expired");
    }
    const passwordHash = await hashPassword(input.password);
    await UserRepository.applyPasswordReset(found.id, passwordHash);
  },
};

export const serializeUser = (user: UserPublic) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  emailVerified: user.emailVerified,
  companyMembership: user.companyMembership,
  createdAt: user.createdAt.toISOString(),
  company: user.company,
});
