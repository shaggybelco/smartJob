import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const applicantEmail = "demo@smartjob.local";
  const recruiterEmail = "recruiter@smartjob.local";

  const passwordHash = await bcrypt.hash("demo1234", 10);

  // ── Company (Acme Corp) ─────────────────────────────────────
  const acme = await prisma.company.upsert({
    where: { name: "Acme Corp" },
    update: {},
    create: {
      name: "Acme Corp",
      website: "https://acme.example.com",
      description: "We make industrial-strength widgets and hire great people.",
    },
  });

  // ── Recruiter ───────────────────────────────────────────────
  const recruiter = await prisma.user.upsert({
    where: { email: recruiterEmail },
    update: { role: "RECRUITER", companyId: acme.id },
    create: {
      email: recruiterEmail,
      name: "Rachel Recruiter",
      passwordHash,
      role: "RECRUITER",
      companyId: acme.id,
    },
  });

  // ── Jobs (idempotent: create only if no jobs for Acme yet) ──
  const existingJobCount = await prisma.job.count({ where: { companyId: acme.id } });
  if (existingJobCount === 0) {
    await prisma.job.createMany({
      data: [
        {
          companyId: acme.id,
          postedById: recruiter.id,
          title: "Senior Backend Engineer",
          description:
            "Build and scale our distributed widget services. Stack: TypeScript, Postgres, Redis. Remote-friendly.",
          location: "Remote",
          salaryMin: 900_000,
          salaryMax: 1_200_000,
          status: "OPEN",
        },
        {
          companyId: acme.id,
          postedById: recruiter.id,
          title: "Frontend Engineer",
          description:
            "Lead UI work on our dashboard. React, TypeScript, Tailwind. Hybrid in Cape Town.",
          location: "Cape Town",
          salaryMin: 650_000,
          salaryMax: 850_000,
          status: "OPEN",
        },
        {
          companyId: acme.id,
          postedById: recruiter.id,
          title: "Site Reliability Engineer",
          description: "Older role from last quarter — kept for demo of CLOSED jobs.",
          location: "Remote",
          salaryMin: 950_000,
          salaryMax: 1_300_000,
          status: "CLOSED",
        },
      ],
    });
  }

  // ── Applicant (existing demo user) ──────────────────────────
  const applicant = await prisma.user.upsert({
    where: { email: applicantEmail },
    update: { role: "APPLICANT" },
    create: {
      email: applicantEmail,
      name: "Demo Applicant",
      passwordHash,
      role: "APPLICANT",
    },
  });

  // ── Off-platform applications (the original demo) ──────────
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

  // ── In-platform application: applicant → first open Acme job ─
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
              "I'm excited about widget infrastructure and have shipped backend systems at scale. Would love to chat!",
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

  console.log("Seed: applicant + recruiter + Acme jobs + linked in-platform application ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
