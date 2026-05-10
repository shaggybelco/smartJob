import type { RecruiterFunnelSummary } from "@smartjob/shared";
import { useQuery } from "@tanstack/react-query";
import { api } from "./client";

export const useRecruiterFunnel = () =>
  useQuery({
    queryKey: ["recruiterFunnel"],
    queryFn: () => api.get<RecruiterFunnelSummary>("/recruiter/analytics/summary"),
  });
