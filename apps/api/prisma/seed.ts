import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const upsertSkill = (name: string) =>
  prisma.skill.upsert({
    where: { slug: slugify(name) },
    update: {},
    create: { name, slug: slugify(name) },
  });

async function main() {
  const applicantEmail = "demo@smartjob.local";
  const recruiterEmail = "recruiter@smartjob.local";
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const acme = await prisma.company.upsert({
    where: { name: "Acme Corp" },
    update: {},
    create: {
      name: "Acme Corp",
      website: "https://acme.example.com",
      description: "Industrial-strength widgets, hiring great engineers.",
    },
  });

  const recruiter = await prisma.user.upsert({
    where: { email: recruiterEmail },
    update: {
      role: "RECRUITER",
      companyId: acme.id,
      companyMembership: "ADMIN",
      emailVerified: true,
    },
    create: {
      email: recruiterEmail,
      name: "Rachel Recruiter",
      passwordHash,
      role: "RECRUITER",
      companyId: acme.id,
      companyMembership: "ADMIN",
      emailVerified: true,
    },
  });

  const skills = await Promise.all(
    ["TypeScript", "Postgres", "React", "Node.js", "GraphQL", "AWS", "Docker", "Kubernetes"].map(
      upsertSkill,
    ),
  );
  const skillByName = (name: string) => skills.find((s) => s.name === name)!;

  const ensureSkills = async (jobId: string, names: string[]) => {
    const existing = await prisma.jobSkill.count({ where: { jobId } });
    if (existing > 0) return;
    await prisma.jobSkill.createMany({
      data: names.map((n) => ({ jobId, skillId: skillByName(n).id })),
      skipDuplicates: true,
    });
  };

  const existingJobCount = await prisma.job.count({ where: { companyId: acme.id } });
  if (existingJobCount > 0) {
    const backend = await prisma.job.findFirst({
      where: { companyId: acme.id, title: "Senior Backend Engineer" },
    });
    if (backend) {
      await ensureSkills(backend.id, ["TypeScript", "Postgres", "Node.js", "AWS"]);
      const qCount = await prisma.jobQuestion.count({ where: { jobId: backend.id } });
      if (qCount === 0) {
        await prisma.jobQuestion.createMany({
          data: [
            { jobId: backend.id, prompt: "What's your notice period?", required: true, position: 0 },
            { jobId: backend.id, prompt: "Tell us about a system you scaled.", required: false, position: 1 },
          ],
        });
      }
      await prisma.job.update({ where: { id: backend.id }, data: { remote: true } });
    }
    const frontend = await prisma.job.findFirst({
      where: { companyId: acme.id, title: "Frontend Engineer" },
    });
    if (frontend) await ensureSkills(frontend.id, ["TypeScript", "React"]);
  }
  if (existingJobCount === 0) {
    const backend = await prisma.job.create({
      data: {
        companyId: acme.id,
        postedById: recruiter.id,
        title: "Senior Backend Engineer",
        description:
          "Build and scale our distributed widget services. Stack: TypeScript, Postgres, Redis. Remote-friendly.",
        location: "Remote",
        remote: true,
        salaryMin: 900_000,
        salaryMax: 1_200_000,
        status: "OPEN",
      },
    });
    await prisma.jobSkill.createMany({
      data: ["TypeScript", "Postgres", "Node.js", "AWS"].map((n) => ({
        jobId: backend.id,
        skillId: skillByName(n).id,
      })),
    });
    await prisma.jobQuestion.createMany({
      data: [
        { jobId: backend.id, prompt: "What's your notice period?", required: true, position: 0 },
        { jobId: backend.id, prompt: "Tell us about a system you scaled.", required: false, position: 1 },
      ],
    });

    const frontend = await prisma.job.create({
      data: {
        companyId: acme.id,
        postedById: recruiter.id,
        title: "Frontend Engineer",
        description:
          "Lead UI work on our dashboard. React, TypeScript, Tailwind. Hybrid in Cape Town.",
        location: "Cape Town",
        remote: false,
        salaryMin: 650_000,
        salaryMax: 850_000,
        status: "OPEN",
      },
    });
    await prisma.jobSkill.createMany({
      data: ["TypeScript", "React"].map((n) => ({
        jobId: frontend.id,
        skillId: skillByName(n).id,
      })),
    });

    await prisma.job.create({
      data: {
        companyId: acme.id,
        postedById: recruiter.id,
        title: "Site Reliability Engineer",
        description: "Closed role from last quarter. Kept for the demo of CLOSED jobs.",
        location: "Remote",
        remote: true,
        salaryMin: 950_000,
        salaryMax: 1_300_000,
        status: "CLOSED",
      },
    });
  }

  const applicant = await prisma.user.upsert({
    where: { email: applicantEmail },
    update: { role: "APPLICANT", emailVerified: true },
    create: {
      email: applicantEmail,
      name: "Demo Applicant",
      passwordHash,
      role: "APPLICANT",
      emailVerified: true,
    },
  });

  const existingTracker = await prisma.application.count({
    where: { userId: applicant.id, jobApplicationId: null },
  });
  if (existingTracker === 0) {
    await prisma.application.createMany({
      data: [
        { userId: applicant.id, company: "Globex", role: "Full Stack Developer", status: "APPLIED", source: "Indeed", salary: 720_000 },
        { userId: applicant.id, company: "Initech", role: "Backend Engineer", status: "REJECTED", source: "Referral", salary: 820_000 },
        { userId: applicant.id, company: "Stark Industries", role: "Platform Engineer", status: "OFFER", source: "Direct", salary: 1_100_000 },
      ],
    });
  }

  const firstOpenJob = await prisma.job.findFirst({
    where: { companyId: acme.id, status: "OPEN" },
    orderBy: { createdAt: "asc" },
  });
  if (firstOpenJob) {
    const alreadyApplied = await prisma.jobApplication.findUnique({
      where: { jobId_applicantId: { jobId: firstOpenJob.id, applicantId: applicant.id } },
    });
    if (!alreadyApplied) {
      await prisma.$transaction(async (tx) => {
        const ja = await tx.jobApplication.create({
          data: {
            jobId: firstOpenJob.id,
            applicantId: applicant.id,
            coverLetter:
              "I'm excited about widget infrastructure and have shipped backend systems at scale.",
            status: "INTERVIEW",
          },
        });
        await tx.application.create({
          data: {
            userId: applicant.id,
            company: "Acme Corp",
            role: firstOpenJob.title,
            status: "INTERVIEW",
            source: "Job Board",
            location: firstOpenJob.location ?? null,
            jobApplicationId: ja.id,
          },
        });
      });
    }
  }

  console.log("Seed: applicant + recruiter + Acme jobs + skills + sample questions ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
