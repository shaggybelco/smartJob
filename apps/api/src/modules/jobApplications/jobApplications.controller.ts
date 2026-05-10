import {
  APP_STATUSES,
  type AppStatus,
  BulkUpdateJobApplicationsInput,
  UpdateJobApplicationInput,
} from "@smartjob/shared";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { JobApplicationsService } from "./jobApplications.service.js";

export const JobApplicationsController = {
  detailForRecruiter: asyncHandler(async (req, res) => {
    res.json(await JobApplicationsService.getForRecruiter(req.params.id, req.userId!));
  }),

  updateForRecruiter: asyncHandler(async (req, res) => {
    const input = UpdateJobApplicationInput.parse(req.body);
    res.json(
      await JobApplicationsService.updateForRecruiter(req.params.id, req.userId!, input),
    );
  }),

  bulkUpdate: asyncHandler(async (req, res) => {
    const input = BulkUpdateJobApplicationsInput.parse(req.body);
    res.json(await JobApplicationsService.bulkUpdateForRecruiter(req.userId!, input));
  }),

  listMine: asyncHandler(async (req, res) => {
    res.json(await JobApplicationsService.listMine(req.userId!));
  }),

  withdraw: asyncHandler(async (req, res) => {
    await JobApplicationsService.withdraw(req.params.id, req.userId!);
    res.status(204).end();
  }),

  recruiterInbox: asyncHandler(async (req, res) => {
    const raw = typeof req.query.status === "string" ? req.query.status : undefined;
    const status =
      raw && (APP_STATUSES as readonly string[]).includes(raw)
        ? (raw as AppStatus)
        : undefined;
    res.json(await JobApplicationsService.listForRecruiterInbox(req.userId!, status));
  }),
};
