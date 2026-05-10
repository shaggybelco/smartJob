import type { ApplicantsListQuery } from "@smartjob/shared";
import type { Prisma } from "@prisma/client";
import { HttpError } from "../../middleware/error.js";
import { slugify } from "../skills/skills.repository.js";
import { ApplicantRepository } from "./applicants.repository.js";

const yearsBetween = (start: Date, end: Date) =>
  Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

const computeYears = (
  experiences: { startDate: Date; endDate: Date | null; current: boolean }[],
): number => {
  const total = experiences.reduce((sum, e) => {
    const end = e.current || !e.endDate ? new Date() : e.endDate;
    return sum + yearsBetween(e.startDate, end);
  }, 0);
  return Math.floor(total);
};

const flattenSkills = <T extends { skills: { skill: { id: string; name: string; slug: string } }[] }>(
  user: T,
) => ({ ...user, skills: user.skills.map((s) => s.skill) });

export const ApplicantsService = {
  async list(q: ApplicantsListQuery) {
    const skillSlugs = (q.skills ?? "")
      .split(",")
      .map((s) => slugify(s.trim()))
      .filter(Boolean);

    let skillFilter: Prisma.UserWhereInput = {};
    if (skillSlugs.length > 0) {
      if (q.skillMatch === "all") {
        skillFilter = {
          AND: skillSlugs.map((slug) => ({
            skills: { some: { skill: { slug } } },
          })),
        };
      } else {
        skillFilter = {
          skills: { some: { skill: { slug: { in: skillSlugs } } } },
        };
      }
    }

    const where: Prisma.UserWhereInput = {
      role: "APPLICANT",
      searchable: true,
      ...(q.q
        ? {
            OR: [
              { name: { contains: q.q, mode: "insensitive" } },
              { headline: { contains: q.q, mode: "insensitive" } },
              { bio: { contains: q.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...skillFilter,
    };

    const [items, total] = await ApplicantRepository.search(
      where,
      (q.page - 1) * q.pageSize,
      q.pageSize,
    );

    let summaries = items.map((u) => {
      const flat = flattenSkills(u);
      const yearsOfExperience = computeYears(u.experiences);
      return {
        id: flat.id,
        name: flat.name,
        headline: flat.headline,
        bio: flat.bio,
        skills: flat.skills,
        yearsOfExperience,
        searchable: flat.searchable,
        createdAt: flat.createdAt.toISOString(),
      };
    });

    if (q.minYears !== undefined && q.minYears > 0) {
      summaries = summaries.filter((s) => s.yearsOfExperience >= q.minYears!);
    }

    return {
      items: summaries,
      page: q.page,
      pageSize: q.pageSize,
      total,
      totalPages: Math.ceil(total / q.pageSize),
    };
  },

  async detail(id: string) {
    const user = await ApplicantRepository.findDiscoverable(id);
    if (!user) throw new HttpError(404, "Applicant not found");
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      headline: user.headline,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
      skills: user.skills.map((s) => s.skill),
      experiences: user.experiences.map((e) => ({
        id: e.id,
        title: e.title,
        company: e.company,
        location: e.location,
        description: e.description,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate ? e.endDate.toISOString() : null,
        current: e.current,
      })),
      yearsOfExperience: computeYears(user.experiences),
    };
  },
};
