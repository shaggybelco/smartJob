import { prisma } from "../../config/prisma.js";

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

export const SkillRepository = {
  search: (q?: string, limit = 30) =>
    prisma.skill.findMany({
      where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
      orderBy: { name: "asc" },
      take: limit,
    }),

  upsertMany: async (names: string[]) => {
    const cleaned = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
    return Promise.all(
      cleaned.map((name) => {
        const slug = slugify(name);
        return prisma.skill.upsert({
          where: { slug },
          update: {},
          create: { name, slug },
        });
      }),
    );
  },

  findBySlug: (slug: string) =>
    prisma.skill.findUnique({ where: { slug: slugify(slug) } }),
};

export { slugify };
