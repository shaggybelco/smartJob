import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

export const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  emailVerified: true,
  companyMembership: true,
  createdAt: true,
  company: {
    select: { id: true, name: true, website: true, description: true },
  },
} as const satisfies Prisma.UserSelect;

export type UserPublic = Prisma.UserGetPayload<{ select: typeof userPublicSelect }>;
export type UserWithHash = UserPublic & { passwordHash: string };

export const UserRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email }, select: userPublicSelect }),

  findByEmailWithHash: (email: string): Promise<UserWithHash | null> =>
    prisma.user.findUnique({
      where: { email },
      select: { ...userPublicSelect, passwordHash: true },
    }),

  findPublicById: (id: string) =>
    prisma.user.findUnique({ where: { id }, select: userPublicSelect }),

  findByVerificationToken: (token: string) =>
    prisma.user.findUnique({
      where: { emailVerificationToken: token },
      select: { id: true },
    }),

  findByResetToken: (token: string) =>
    prisma.user.findUnique({
      where: { passwordResetToken: token },
      select: { id: true, passwordResetExpiresAt: true },
    }),

  create: (data: {
    email: string;
    name: string;
    passwordHash: string;
    role: "APPLICANT" | "RECRUITER";
    companyId?: string;
    companyMembership?: "PENDING" | "APPROVED" | "ADMIN";
    emailVerificationToken?: string;
  }) =>
    prisma.user.create({
      data,
      select: userPublicSelect,
    }),

  setVerified: (id: string) =>
    prisma.user.update({
      where: { id },
      data: { emailVerified: true, emailVerificationToken: null },
    }),

  setResetToken: (id: string, token: string, expiresAt: Date) =>
    prisma.user.update({
      where: { id },
      data: { passwordResetToken: token, passwordResetExpiresAt: expiresAt },
    }),

  applyPasswordReset: (id: string, passwordHash: string) =>
    prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        tokenVersion: { increment: 1 },
      },
    }),
};

export const CompanyRepository = {
  findByName: (name: string) =>
    prisma.company.findUnique({ where: { name } }),

  findById: (id: string) =>
    prisma.company.findUnique({ where: { id } }),

  create: (name: string) =>
    prisma.company.create({ data: { name }, select: { id: true, name: true } }),
};
