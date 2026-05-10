import {
  UpdateProfileInput,
  UpdateUserSkillsInput,
  WorkExperienceInput,
} from "@smartjob/shared";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { ProfileService } from "./profile.service.js";

export const ProfileController = {
  get: asyncHandler(async (req, res) => {
    res.json(await ProfileService.get(req.userId!));
  }),

  updateBasics: asyncHandler(async (req, res) => {
    const input = UpdateProfileInput.parse(req.body);
    res.json(await ProfileService.updateBasics(req.userId!, input));
  }),

  setSkills: asyncHandler(async (req, res) => {
    const input = UpdateUserSkillsInput.parse(req.body);
    res.json(await ProfileService.setSkills(req.userId!, input));
  }),

  addExperience: asyncHandler(async (req, res) => {
    const input = WorkExperienceInput.parse(req.body);
    const created = await ProfileService.addExperience(req.userId!, input);
    res.status(201).json(created);
  }),

  updateExperience: asyncHandler(async (req, res) => {
    const input = WorkExperienceInput.parse(req.body);
    await ProfileService.updateExperience(req.params.id!, req.userId!, input);
    res.status(204).end();
  }),

  removeExperience: asyncHandler(async (req, res) => {
    await ProfileService.removeExperience(req.params.id!, req.userId!);
    res.status(204).end();
  }),
};
