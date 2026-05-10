import { asyncHandler } from "../../lib/asyncHandler.js";
import { AnalyticsService } from "./analytics.service.js";

export const AnalyticsController = {
  summary: asyncHandler(async (req, res) => {
    res.json(await AnalyticsService.summary(req.userId!));
  }),
};
