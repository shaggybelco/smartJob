import type {
  UpdateProfileInput,
  UpdateUserSkillsInput,
  WorkExperienceInput,
} from "@smartjob/shared";
import { HttpError } from "../../middleware/error.js";
import { SkillRepository } from "../skills/skills.repository.js";
import { ProfileRepository } from "./profile.repository.js";

const flattenSkills = <T extends { skills: { skill: { id: string; name: string; slug: string } }[] }>(
  user: T,
) => ({ ...user, skills: user.skills.map((s) => s.skill) });

export const ProfileService = {
  async get(userId: string) {
    const profile = await ProfileRepository.getFull(userId);
    if (!profile) throw new HttpError(404, "Profile not found");
    const flat = flattenSkills(profile);
    return {
      user: {
        id: flat.id,
        email: flat.email,
        name: flat.name,
        role: flat.role,
        emailVerified: flat.emailVerified,
        headline: flat.headline,
        bio: flat.bio,
        company: flat.company,
        companyMembership: flat.companyMembership,
        createdAt: flat.createdAt.toISOString(),
      },
      skills: flat.skills,
      experiences: flat.experiences.map((e) => ({
        id: e.id,
        userId: e.userId,
        title: e.title,
        company: e.company,
        location: e.location,
        description: e.description,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate ? e.endDate.toISOString() : null,
        current: e.current,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  },

  async updateBasics(userId: string, input: UpdateProfileInput) {
    await ProfileRepository.updateBasics(userId, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.headline !== undefined ? { headline: input.headline } : {}),
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
    });
    return ProfileService.get(userId);
  },

  async setSkills(userId: string, input: UpdateUserSkillsInput) {
    const skills = await SkillRepository.upsertMany(input.skills);
    await ProfileRepository.replaceSkills(userId, skills.map((s) => s.id));
    return ProfileService.get(userId);
  },

  async addExperience(userId: string, input: WorkExperienceInput) {
    if (input.endDate && !input.current) {
      // ok
    }
    return ProfileRepository.createExperience(userId, {
      title: input.title,
      company: input.company,
      location: input.location ?? null,
      description: input.description ?? null,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      current: input.current,
      userId,
    });
  },

  async updateExperience(id: string, userId: string, input: WorkExperienceInput) {
    const result = await ProfileRepository.updateExperience(id, userId, {
      title: input.title,
      company: input.company,
      location: input.location ?? null,
      description: input.description ?? null,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      current: input.current,
    });
    if (result.count === 0) throw new HttpError(404, "Experience not found");
  },

  async removeExperience(id: string, userId: string) {
    const result = await ProfileRepository.deleteExperience(id, userId);
    if (result.count === 0) throw new HttpError(404, "Experience not found");
  },
};
