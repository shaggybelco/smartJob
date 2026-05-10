import { HttpError } from "../../middleware/error.js";
import { CompanyRepository } from "./companies.repository.js";

export const CompaniesService = {
  async getPublic(id: string) {
    const company = await CompanyRepository.findPublicById(id);
    if (!company) throw new HttpError(404, "Company not found");
    const jobs = await CompanyRepository.listOpenJobs(id);
    return {
      ...company,
      jobs: jobs.map((j) => ({
        ...j,
        skills: j.skills.map((s) => s.skill),
      })),
    };
  },
};
