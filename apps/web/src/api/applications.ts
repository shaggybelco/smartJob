import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "@smartjob/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

export interface ApplicationsListResponse {
  items: Application[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApplicationsListParams {
  status?: string;
  q?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

const buildQuery = (p: ApplicationsListParams) => {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined && v !== "") params.append(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
};

export const applicationKeys = {
  all: ["applications"] as const,
  list: (p: ApplicationsListParams) => ["applications", "list", p] as const,
  detail: (id: string) => ["applications", "detail", id] as const,
};

export const useApplications = (params: ApplicationsListParams = {}) =>
  useQuery({
    queryKey: applicationKeys.list(params),
    queryFn: () =>
      api.get<ApplicationsListResponse>(`/applications${buildQuery(params)}`),
  });

export const useApplication = (id: string | undefined) =>
  useQuery({
    queryKey: id ? applicationKeys.detail(id) : ["applications", "detail", "noop"],
    queryFn: () => api.get<Application>(`/applications/${id}`),
    enabled: !!id,
  });

export const useCreateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApplicationInput) =>
      api.post<Application>("/applications", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: applicationKeys.all }),
  });
};

export const useUpdateApplication = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateApplicationInput) =>
      api.patch<Application>(`/applications/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: applicationKeys.all }),
  });
};

export const useDeleteApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/applications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: applicationKeys.all }),
  });
};
