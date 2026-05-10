import type {
  ApplicationsListQuery,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "@smartjob/shared";
import { HttpError } from "../../middleware/error.js";
import { ApplicationRepository } from "./applications.repository.js";

export const ApplicationsService = {
  async list(userId: string, q: ApplicationsListQuery) {
    const where = {
      userId,
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
    const [items, total] = await ApplicationRepository.list(
      where,
      { [q.sort]: q.order },
      (q.page - 1) * q.pageSize,
      q.pageSize,
    );
    return {
      items,
      page: q.page,
      pageSize: q.pageSize,
      total,
      totalPages: Math.ceil(total / q.pageSize),
    };
  },

  async getOwned(id: string, userId: string) {
    const app = await ApplicationRepository.findOwnedById(id, userId);
    if (!app) throw new HttpError(404, "Application not found");
    return app;
  },

  create(userId: string, input: CreateApplicationInput) {
    return ApplicationRepository.create({
      ...input,
      source: input.source ?? null,
      salary: input.salary ?? null,
      jobUrl: input.jobUrl ?? null,
      location: input.location ?? null,
      notes: input.notes ?? null,
      appliedAt: input.appliedAt ? new Date(input.appliedAt) : new Date(),
      userId,
    });
  },

  async update(id: string, userId: string, input: UpdateApplicationInput) {
    const existing = await ApplicationRepository.findOwnedSummary(id, userId);
    if (!existing) throw new HttpError(404, "Application not found");

    if (existing.jobApplicationId && input.status !== undefined) {
      throw new HttpError(
        400,
        "Status of in-platform applications is managed by the recruiter",
      );
    }

    return ApplicationRepository.update(existing.id, {
      ...input,
      appliedAt: input.appliedAt ? new Date(input.appliedAt) : undefined,
    });
  },

  async remove(id: string, userId: string) {
    const existing = await ApplicationRepository.findOwnedSummary(id, userId);
    if (!existing) throw new HttpError(404, "Application not found");
    await ApplicationRepository.delete(existing.id);
  },
};
