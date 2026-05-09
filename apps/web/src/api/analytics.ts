import type { AnalyticsSummary } from "@smartjob/shared";
import { useQuery } from "@tanstack/react-query";
import { api } from "./client";

export const useAnalyticsSummary = () =>
  useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: () => api.get<AnalyticsSummary>("/analytics/summary"),
  });
