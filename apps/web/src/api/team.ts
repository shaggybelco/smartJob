import type { CompanyMembership } from "@smartjob/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  membership: CompanyMembership;
  createdAt: string;
  isMe: boolean;
}

const teamKeys = {
  all: ["team"] as const,
};

export const useTeam = () =>
  useQuery({
    queryKey: teamKeys.all,
    queryFn: () => api.get<TeamMember[]>("/recruiter/members"),
  });

const memberAction = (path: (id: string) => string, method: "POST" | "DELETE") => () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      method === "DELETE"
        ? api.delete<void>(path(id))
        : api.post<void>(path(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.all }),
  });
};

export const useApproveMember = memberAction((id) => `/recruiter/members/${id}/approve`, "POST");
export const usePromoteMember = memberAction((id) => `/recruiter/members/${id}/promote`, "POST");
export const useDemoteMember = memberAction((id) => `/recruiter/members/${id}/demote`, "POST");
export const useRevokeMember = memberAction((id) => `/recruiter/members/${id}`, "DELETE");
