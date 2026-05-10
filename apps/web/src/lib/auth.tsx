import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { PublicUser, RegisterInput, Role } from "@smartjob/shared";
import { authApi } from "../api/auth";
import { ApiError } from "../api/client";
import { PendingApprovalPage } from "../pages/auth/PendingApprovalPage";

interface AuthState {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  const fetchMe = () =>
    authApi
      .me()
      .then(setUser)
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 401)) console.error(err);
        setUser(null);
      });

  useEffect(() => {
    fetchMe().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const u = await authApi.login({ email, password });
    setUser(u);
    qc.clear();
  };

  const register = async (input: RegisterInput) => {
    const u = await authApi.register(input);
    setUser(u);
    qc.clear();
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    qc.clear();
  };

  const refresh = async () => {
    await fetchMe();
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const useRole = (): Role | null => useAuth().user?.role ?? null;

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return (
      <div className="p-8 text-center text-rose-600">
        Access denied — this page is for {role.toLowerCase()}s only.
      </div>
    );
  }
  return <>{children}</>;
}

// Show the pending screen for recruiters who haven't been approved yet.
// Wrap recruiter-only routes that require approval (post jobs, view inbox, etc.)
// with this component AFTER RequireRole("RECRUITER").
export function RequireApprovedRecruiter({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!user || user.role !== "RECRUITER") return <Navigate to="/" replace />;
  if (user.companyMembership === "PENDING") return <PendingApprovalPage />;
  return <>{children}</>;
}

export function RequireCompanyAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!user || user.role !== "RECRUITER") return <Navigate to="/" replace />;
  if (user.companyMembership !== "ADMIN") {
    return (
      <div className="p-8 text-center text-rose-600">
        This page is for company admins only.
      </div>
    );
  }
  return <>{children}</>;
}
