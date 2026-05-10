import { prisma } from "../../config/prisma.js";

export const CompanyRepository = {
  findPublicById: (id: string) =>
    prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        website: true,
        description: true,
        _count: { select: { jobs: { where: { status: "OPEN" } } } },
      },
    }),
};
