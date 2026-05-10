import { ApplicantsListQuery } from "@smartjob/shared";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { ApplicantsService } from "./applicants.service.js";

export const ApplicantsController = {
  list: asyncHandler(async (req, res) => {
    const q = ApplicantsListQuery.parse(req.query);
    res.json(await ApplicantsService.list(q));
  }),

  detail: asyncHandler(async (req, res) => {
    res.json(await ApplicantsService.detail(req.params.id!));
  }),
};
