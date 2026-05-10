import type { ApplicantSummary, Skill, WorkExperience } from "@smartjob/shared";
import { useQuery } from "@tanstack/react-query";
import { api } from "./client";

export interface ApplicantSearchParams {
  q?: string;
  skills?: string[];
  skillMatch?: "any" | "all";
  minYears?: number;
  page?: number;
  pageSize?: number;
}

export interface ApplicantSearchResponse {
  items: ApplicantSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApplicantDetail {
  id: string;
  name: string;
  email: string;
  headline: string | null;
  bio: string | null;
  createdAt: string;
  skills: Skill[];
  experiences: WorkExperience[];
  yearsOfExperience: number;
}

const buildQuery = (p: ApplicantSearchParams) => {
  const params = new URLSearchParams();
  if (p.q) params.set("q", p.q);
  if (p.skills && p.skills.length) params.set("skills", p.skills.join(","));
  if (p.skillMatch) params.set("skillMatch", p.skillMatch);
  if (p.minYears != null) params.set("minYears", String(p.minYears));
  if (p.page) params.set("page", String(p.page));
  if (p.pageSize) params.set("pageSize", String(p.pageSize));
  const s = params.toString();
  return s ? `?${s}` : "";
};

export const useApplicantSearch = (params: ApplicantSearchParams) =>
  useQuery({
    queryKey: ["applicants", "search", params],
    queryFn: () =>
      api.get<ApplicantSearchResponse>(`/recruiter/applicants${buildQuery(params)}`),
  });

export const useApplicant = (id: string | undefined) =>
  useQuery({
    queryKey: id ? ["applicants", "detail", id] : ["applicants", "detail", "noop"],
    queryFn: () => api.get<ApplicantDetail>(`/recruiter/applicants/${id}`),
    enabled: !!id,
  });
