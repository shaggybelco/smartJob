import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@smartjob.local";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Seed: user ${email} already exists, skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.create({
    data: { email, name: "Demo User", passwordHash },
  });

  await prisma.application.createMany({
    data: [
      { userId: user.id, company: "Acme Corp", role: "Senior Engineer", status: "INTERVIEW", source: "LinkedIn", salary: 120000 },
      { userId: user.id, company: "Globex", role: "Full Stack Developer", status: "APPLIED", source: "Indeed", salary: 95000 },
      { userId: user.id, company: "Initech", role: "Backend Engineer", status: "REJECTED", source: "Referral", salary: 110000 },
      { userId: user.id, company: "Stark Industries", role: "Platform Engineer", status: "OFFER", source: "Direct", salary: 140000 },
    ],
  });

  console.log(`Seed: created user ${email} with 4 sample applications.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
