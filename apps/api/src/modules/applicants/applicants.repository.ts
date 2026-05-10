import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

const skillsInclude = { skills: { include: { skill: true } } } as const;

export const ApplicantRepository = {
  search: (where: Prisma.UserWhereInput, skip: number, take: number) =>
    Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          name: true,
          headline: true,
          bio: true,
          searchable: true,
          createdAt: true,
          ...skillsInclude,
          experiences: { select: { startDate: true, endDate: true, current: true } },
        },
      }),
      prisma.user.count({ where }),
    ]),

  findDiscoverable: (id: string) =>
    prisma.user.findFirst({
      where: { id, role: "APPLICANT", searchable: true },
      select: {
        id: true,
        name: true,
        email: true,
        headline: true,
        bio: true,
        createdAt: true,
        searchable: true,
        ...skillsInclude,
        experiences: { orderBy: [{ current: "desc" }, { startDate: "desc" }] },
      },
    }),
};
