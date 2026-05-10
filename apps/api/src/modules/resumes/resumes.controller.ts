import { asyncHandler } from "../../lib/asyncHandler.js";
import { ResumesService } from "./resumes.service.js";

export const ResumesController = {
  download: asyncHandler(async (req, res) => {
    const resolved = await ResumesService.resolve(req.params.id!, req.userId!);
    res.setHeader("Content-Type", resolved.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${resolved.filename.replace(/"/g, "")}"`,
    );
    if (resolved.size) res.setHeader("Content-Length", String(resolved.size));
    res.sendFile(resolved.absolutePath);
  }),
};
