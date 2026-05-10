import type { Skill } from "@smartjob/shared";
import { useQuery } from "@tanstack/react-query";
import { api } from "./client";

export const useSkills = (q?: string) =>
  useQuery({
    queryKey: ["skills", q ?? ""],
    queryFn: () => api.get<Skill[]>(`/skills${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  });
