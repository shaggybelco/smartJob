import type { LoginInput, PublicUser, RegisterInput } from "@smartjob/shared";
import { api } from "./client";

export const authApi = {
  me: () => api.get<PublicUser>("/auth/me"),
  login: (input: LoginInput) => api.post<PublicUser>("/auth/login", input),
  register: (input: RegisterInput) => api.post<PublicUser>("/auth/register", input),
  logout: () => api.post<void>("/auth/logout"),
};
