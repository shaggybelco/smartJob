import { HttpError } from "../../middleware/error.js";
import { CompanyRepository } from "./companies.repository.js";

export const CompaniesService = {
  async getPublic(id: string) {
    const company = await CompanyRepository.findPublicById(id);
    if (!company) throw new HttpError(404, "Company not found");
    return company;
  },
};
