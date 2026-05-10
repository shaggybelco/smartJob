import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

/** Shape returned to the client (sans passwordHash). */
export const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
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

  create: (data: {
    email: string;
    name: string;
    passwordHash: string;
    role: "APPLICANT" | "RECRUITER";
    companyId?: string;
  }) =>
    prisma.user.create({
      data,
      select: userPublicSelect,
    }),
};

export const CompanyRepository = {
  upsertByName: (name: string) =>
    prisma.company.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true, name: true },
    }),
};
