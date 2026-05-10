import {
  ApplyToJobInput,
  CreateJobInput,
  JobsListQuery,
  UpdateJobInput,
} from "@smartjob/shared";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { JobsService } from "./jobs.service.js";

export const JobsController = {
  // Public
  list: asyncHandler(async (req, res) => {
    const q = JobsListQuery.parse(req.query);
    res.json(await JobsService.listPublic(q));
  }),

  detail: asyncHandler(async (req, res) => {
    res.json(await JobsService.getPublic(req.params.id));
  }),

  // Recruiter
  create: asyncHandler(async (req, res) => {
    const input = CreateJobInput.parse(req.body);
    const created = await JobsService.create(req.userId!, input);
    res.status(201).json(created);
  }),

  update: asyncHandler(async (req, res) => {
    const input = UpdateJobInput.parse(req.body);
    res.json(await JobsService.update(req.params.id, req.userId!, input));
  }),

  close: asyncHandler(async (req, res) => {
    res.json(await JobsService.close(req.params.id, req.userId!));
  }),

  remove: asyncHandler(async (req, res) => {
    await JobsService.remove(req.params.id, req.userId!);
    res.status(204).end();
  }),

  myJobs: asyncHandler(async (req, res) => {
    res.json(await JobsService.listMyCompanyJobs(req.userId!));
  }),

  inbox: asyncHandler(async (req, res) => {
    res.json(await JobsService.listInbox(req.params.id, req.userId!));
  }),

  // Applicant
  apply: asyncHandler(async (req, res) => {
    const input = ApplyToJobInput.parse(req.body);
    // Multer attaches the uploaded file as req.file when the field name is "resume".
    const file = (req as unknown as { file?: Express.Multer.File }).file;
    const created = await JobsService.applyToJob(
      req.params.id,
      req.userId!,
      input,
      file
        ? {
            storageKey: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
          }
        : undefined,
    );
    res.status(201).json(created);
  }),
};
