import { prisma } from "../../config/prisma.js";

export const MemberRepository = {
  list: (companyId: string) =>
    prisma.user.findMany({
      where: { companyId, role: "RECRUITER" },
      orderBy: [{ companyMembership: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        email: true,
        name: true,
        companyMembership: true,
        createdAt: true,
      },
    }),

  findInCompany: (userId: string, companyId: string) =>
    prisma.user.findFirst({
      where: { id: userId, companyId },
      select: { id: true, companyMembership: true },
    }),

  countAdmins: (companyId: string) =>
    prisma.user.count({
      where: { companyId, companyMembership: "ADMIN" },
    }),

  setMembership: (
    userId: string,
    membership: "PENDING" | "APPROVED" | "ADMIN",
  ) =>
    prisma.user.update({
      where: { id: userId },
      data: { companyMembership: membership },
      select: { id: true, companyMembership: true },
    }),

  removeFromCompany: (userId: string) =>
    prisma.user.update({
      where: { id: userId },
      data: { companyId: null, companyMembership: null },
      select: { id: true },
    }),
};
