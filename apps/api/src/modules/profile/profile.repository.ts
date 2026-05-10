import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

export const ProfileRepository = {
  getFull: (userId: string) =>
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        headline: true,
        bio: true,
        createdAt: true,
        company: { select: { id: true, name: true, website: true, description: true } },
        companyMembership: true,
        skills: { include: { skill: true } },
        experiences: { orderBy: [{ current: "desc" }, { startDate: "desc" }] },
      },
    }),

  updateBasics: (userId: string, data: Prisma.UserUpdateInput) =>
    prisma.user.update({ where: { id: userId }, data, select: { id: true } }),

  replaceSkills: async (userId: string, skillIds: string[]) => {
    await prisma.userSkill.deleteMany({ where: { userId } });
    if (skillIds.length > 0) {
      await prisma.userSkill.createMany({
        data: skillIds.map((skillId) => ({ userId, skillId })),
        skipDuplicates: true,
      });
    }
  },

  listSkillIds: (userId: string) =>
    prisma.userSkill.findMany({ where: { userId }, select: { skillId: true } }),

  createExperience: (userId: string, data: Prisma.WorkExperienceUncheckedCreateInput) =>
    prisma.workExperience.create({ data: { ...data, userId } }),

  updateExperience: (id: string, userId: string, data: Prisma.WorkExperienceUpdateInput) =>
    prisma.workExperience.updateMany({
      where: { id, userId },
      data,
    }),

  deleteExperience: (id: string, userId: string) =>
    prisma.workExperience.deleteMany({ where: { id, userId } }),
};
