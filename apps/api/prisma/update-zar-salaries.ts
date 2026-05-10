/**
 * One-off: rewrite the demo USD-ish salary numbers as realistic ZAR amounts.
 * Run with: pnpm --filter api exec tsx prisma/update-zar-salaries.ts
 * Safe to re-run; updates by row identity (title / company), not by amount.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const jobUpdates: Array<{ title: string; salaryMin: number; salaryMax: number; location?: string }> = [
  { title: "Senior Backend Engineer", salaryMin: 900_000, salaryMax: 1_200_000 },
  { title: "Frontend Engineer", salaryMin: 650_000, salaryMax: 850_000, location: "Cape Town" },
  { title: "Site Reliability Engineer", salaryMin: 950_000, salaryMax: 1_300_000 },
];

const trackerUpdates: Array<{ company: string; salary: number }> = [
  { company: "Globex", salary: 720_000 },
  { company: "Initech", salary: 820_000 },
  { company: "Stark Industries", salary: 1_100_000 },
];

async function main() {
  for (const u of jobUpdates) {
    const r = await prisma.job.updateMany({
      where: { title: u.title },
      data: {
        salaryMin: u.salaryMin,
        salaryMax: u.salaryMax,
        ...(u.location ? { location: u.location } : {}),
      },
    });
    console.log(`Job "${u.title}": ${r.count} row(s) updated`);
  }

  for (const u of trackerUpdates) {
    const r = await prisma.application.updateMany({
      where: { company: u.company },
      data: { salary: u.salary },
    });
    console.log(`Application @ ${u.company}: ${r.count} row(s) updated`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
