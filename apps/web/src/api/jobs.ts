import type {
  CreateJobInput,
  Job,
  JobApplicationWithApplicant,
  JobWithCompany,
  UpdateJobInput,
} from "@smartjob/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

export interface JobListItem extends JobWithCompany {
  _count?: { applications: number };
}

export interface JobsListResponse {
  items: JobListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface JobsListParams {
  q?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}

const buildQuery = (p: Record<string, unknown>) => {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
};

export const jobKeys = {
  all: ["jobs"] as const,
  publicList: (p: JobsListParams) => ["jobs", "public", p] as const,
  recruiterList: () => ["jobs", "recruiter"] as const,
  detail: (id: string) => ["jobs", "detail", id] as const,
  inbox: (jobId: string) => ["jobs", "inbox", jobId] as const,
};

export const usePublicJobs = (params: JobsListParams = {}) =>
  useQuery({
    queryKey: jobKeys.publicList(params),
    queryFn: () =>
      api.get<JobsListResponse>(
        `/jobs${buildQuery(params as Record<string, unknown>)}`,
      ),
  });

export const useJob = (id: string | undefined) =>
  useQuery({
    queryKey: id ? jobKeys.detail(id) : ["jobs", "detail", "noop"],
    queryFn: () => api.get<JobListItem>(`/jobs/${id}`),
    enabled: !!id,
  });

export const useRecruiterJobs = () =>
  useQuery({
    queryKey: jobKeys.recruiterList(),
    queryFn: () => api.get<JobListItem[]>("/recruiter/jobs"),
  });

export const useCreateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJobInput) => api.post<Job>("/jobs", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  });
};

export const useUpdateJob = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateJobInput) => api.patch<Job>(`/jobs/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  });
};

export const useCloseJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<Job>(`/jobs/${id}/close`),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  });
};

export const useDeleteJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/jobs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  });
};

export const useJobInbox = (jobId: string | undefined) =>
  useQuery({
    queryKey: jobId ? jobKeys.inbox(jobId) : ["jobs", "inbox", "noop"],
    queryFn: () => api.get<JobApplicationWithApplicant[]>(`/jobs/${jobId}/applications`),
    enabled: !!jobId,
  });
