import { Router } from "express";
import {
  ApplicationsListQuery,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "@smartjob/shared";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";

export const applicationsRouter = Router();

applicationsRouter.use(requireAuth);

applicationsRouter.get("/", async (req, res, next) => {
  try {
    const q = ApplicationsListQuery.parse(req.query);
    const where = {
      userId: req.userId!,
      ...(q.status ? { status: q.status } : {}),
      ...(q.q
        ? {
            OR: [
              { company: { contains: q.q, mode: "insensitive" as const } },
              { role: { contains: q.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { [q.sort]: q.order },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.application.count({ where }),
    ]);

    res.json({
      items,
      page: q.page,
      pageSize: q.pageSize,
      total,
      totalPages: Math.ceil(total / q.pageSize),
    });
  } catch (err) {
    next(err);
  }
});

applicationsRouter.post("/", async (req, res, next) => {
  try {
    const input = CreateApplicationInput.parse(req.body);
    const created = await prisma.application.create({
      data: {
        ...input,
        appliedAt: input.appliedAt ? new Date(input.appliedAt) : new Date(),
        userId: req.userId!,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

applicationsRouter.get("/:id", async (req, res, next) => {
  try {
    const app = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: {
        events: { orderBy: { occurredAt: "desc" } },
        reminders: { orderBy: { dueAt: "asc" } },
      },
    });
    if (!app) throw new HttpError(404, "Application not found");
    res.json(app);
  } catch (err) {
    next(err);
  }
});

applicationsRouter.patch("/:id", async (req, res, next) => {
  try {
    const input = UpdateApplicationInput.parse(req.body);
    const existing = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      select: { id: true },
    });
    if (!existing) throw new HttpError(404, "Application not found");

    const updated = await prisma.application.update({
      where: { id: existing.id },
      data: {
        ...input,
        appliedAt: input.appliedAt ? new Date(input.appliedAt) : undefined,
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

applicationsRouter.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      select: { id: true },
    });
    if (!existing) throw new HttpError(404, "Application not found");
    await prisma.application.delete({ where: { id: existing.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
