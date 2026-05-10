import type { JobWithCompany, PublicCompany } from "@smartjob/shared";
import { useQuery } from "@tanstack/react-query";
import { api } from "./client";

export type PublicCompanyDetail = PublicCompany & {
  _count: { jobs: number };
  jobs: JobWithCompany[];
};

export const useCompany = (id: string | undefined) =>
  useQuery({
    queryKey: id ? ["companies", id] : ["companies", "noop"],
    queryFn: () => api.get<PublicCompanyDetail>(`/companies/${id}`),
    enabled: !!id,
  });

export interface CompanySearchResult {
  id: string;
  name: string;
}

export const useCompanySearch = (q: string) =>
  useQuery({
    queryKey: ["companies", "search", q],
    queryFn: () =>
      api.get<CompanySearchResult[]>(
        `/companies${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      ),
  });
