import { asyncHandler } from "../../lib/asyncHandler.js";
import { SavedJobRepository } from "./savedJobs.repository.js";

const flatten = (rows: Awaited<ReturnType<typeof SavedJobRepository.list>>) =>
  rows.map((row) => ({
    jobId: row.jobId,
    savedAt: row.savedAt,
    job: {
      ...row.job,
      skills: row.job.skills.map((s) => s.skill),
    },
  }));

export const SavedJobsController = {
  list: asyncHandler(async (req, res) => {
    res.json(flatten(await SavedJobRepository.list(req.userId!)));
  }),

  ids: asyncHandler(async (req, res) => {
    const rows = await SavedJobRepository.ids(req.userId!);
    res.json(rows.map((r) => r.jobId));
  }),

  save: asyncHandler(async (req, res) => {
    await SavedJobRepository.add(req.userId!, req.params.id);
    res.status(204).end();
  }),

  unsave: asyncHandler(async (req, res) => {
    await SavedJobRepository.remove(req.userId!, req.params.id);
    res.status(204).end();
  }),
};
