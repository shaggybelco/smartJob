import type {
  AppStatus,
  BulkUpdateJobApplicationsInput,
  JobApplication,
  JobApplicationWithApplicant,
  JobApplicationWithJob,
  UpdateJobApplicationInput,
} from "@smartjob/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

export type RecruiterJobApplicationDetail = JobApplicationWithApplicant & {
  job: JobApplicationWithJob["job"];
};

export const jobApplicationKeys = {
  all: ["jobApplications"] as const,
  mine: () => ["jobApplications", "mine"] as const,
  recruiterInbox: (status?: AppStatus) =>
    ["jobApplications", "recruiter-inbox", status ?? "all"] as const,
  detail: (id: string) => ["jobApplications", "detail", id] as const,
};

export type RecruiterInboxItem = JobApplicationWithApplicant & {
  job: {
    id: string;
    title: string;
    location: string | null;
    company: { id: string; name: string; website: string | null; description: string | null };
  };
};

export const useRecruiterInbox = (status?: AppStatus) =>
  useQuery({
    queryKey: jobApplicationKeys.recruiterInbox(status),
    queryFn: () =>
      api.get<RecruiterInboxItem[]>(
        `/recruiter/applications${status ? `?status=${status}` : ""}`,
      ),
  });

export const useApplyToJob = (jobId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      coverLetter,
      resumeUrl,
      resumeFile,
      answers,
    }: {
      coverLetter?: string;
      resumeUrl?: string;
      resumeFile?: File | null;
      answers?: { questionId: string; answer: string }[];
    }) => {
      const form = new FormData();
      if (coverLetter && coverLetter.trim()) form.append("coverLetter", coverLetter);
      if (resumeUrl && resumeUrl.trim()) form.append("resumeUrl", resumeUrl);
      if (resumeFile) form.append("resume", resumeFile);
      if (answers && answers.length > 0) form.append("answers", JSON.stringify(answers));
      return api.postForm<JobApplication>(`/jobs/${jobId}/apply`, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobApplicationKeys.all });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

export const useMyJobApplications = () =>
  useQuery({
    queryKey: jobApplicationKeys.mine(),
    queryFn: () => api.get<JobApplicationWithJob[]>("/me/job-applications"),
  });

export const useWithdrawApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/me/job-applications/${id}/withdraw`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobApplicationKeys.all });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

export const useJobApplicationDetail = (id: string | undefined) =>
  useQuery({
    queryKey: id ? jobApplicationKeys.detail(id) : ["jobApplications", "detail", "noop"],
    queryFn: () => api.get<RecruiterJobApplicationDetail>(`/job-applications/${id}`),
    enabled: !!id,
  });

export const useUpdateJobApplication = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateJobApplicationInput) =>
      api.patch<JobApplication>(`/job-applications/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobApplicationKeys.all });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

export const useBulkUpdateApplications = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BulkUpdateJobApplicationsInput) =>
      api.post<{ updated: number; status: AppStatus; ids: string[] }>(
        "/job-applications/bulk",
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobApplicationKeys.all });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};
