import { asyncHandler } from "../../lib/asyncHandler.js";
import { CompaniesService } from "./companies.service.js";

export const CompaniesController = {
  detail: asyncHandler(async (req, res) => {
    res.json(await CompaniesService.getPublic(req.params.id!));
  }),
};
