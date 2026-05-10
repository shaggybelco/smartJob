import type { SavedJob } from "@smartjob/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

export const savedJobKeys = {
  all: ["savedJobs"] as const,
  ids: () => ["savedJobs", "ids"] as const,
};

export const useSavedJobs = () =>
  useQuery({
    queryKey: savedJobKeys.all,
    queryFn: () => api.get<SavedJob[]>("/me/saved-jobs"),
  });

export const useSavedJobIds = () =>
  useQuery({
    queryKey: savedJobKeys.ids(),
    queryFn: () => api.get<string[]>("/me/saved-jobs/ids"),
  });

export const useSaveJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.put<void>(`/me/saved-jobs/${jobId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savedJobs"] }),
  });
};

export const useUnsaveJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.delete<void>(`/me/saved-jobs/${jobId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savedJobs"] }),
  });
};
