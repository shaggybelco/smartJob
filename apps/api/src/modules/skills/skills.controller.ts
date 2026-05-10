import { asyncHandler } from "../../lib/asyncHandler.js";
import { SkillRepository } from "./skills.repository.js";

export const SkillsController = {
  list: asyncHandler(async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    res.json(await SkillRepository.search(q));
  }),
};
