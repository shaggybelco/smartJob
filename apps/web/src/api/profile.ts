import type {
  ProfileResponse,
  UpdateProfileInput,
  UpdateUserSkillsInput,
  WorkExperience,
  WorkExperienceInput,
} from "@smartjob/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

const profileKey = ["me", "profile"] as const;

export const useProfile = () =>
  useQuery({
    queryKey: profileKey,
    queryFn: () => api.get<ProfileResponse>("/me/profile"),
  });

const invalidateProfile = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: profileKey });
  qc.invalidateQueries({ queryKey: ["jobs"] });
};

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.patch<ProfileResponse>("/me/profile", input),
    onSuccess: () => invalidateProfile(qc),
  });
};

export const useSetMySkills = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserSkillsInput) =>
      api.put<ProfileResponse>("/me/profile/skills", input),
    onSuccess: () => invalidateProfile(qc),
  });
};

export const useAddExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkExperienceInput) =>
      api.post<WorkExperience>("/me/profile/experiences", input),
    onSuccess: () => invalidateProfile(qc),
  });
};

export const useUpdateExperience = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkExperienceInput) =>
      api.patch<void>(`/me/profile/experiences/${id}`, input),
    onSuccess: () => invalidateProfile(qc),
  });
};

export const useDeleteExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/me/profile/experiences/${id}`),
    onSuccess: () => invalidateProfile(qc),
  });
};
