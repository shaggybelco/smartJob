import { Navigate, Route, Routes } from "react-router-dom";
import { RequireRole, useAuth } from "./lib/auth";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./pages/login/LoginPage";
import { RegisterPage } from "./pages/register/RegisterPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ApplicationsPage } from "./pages/applications/ApplicationsPage";
import { ApplicationDetailPage } from "./pages/applications/ApplicationDetailPage";
import { NewApplicationPage } from "./pages/applications/NewApplicationPage";
import { BoardPage } from "./pages/board/BoardPage";
import { JobBoardPage } from "./pages/jobs/JobBoardPage";
import { JobDetailPage } from "./pages/jobs/JobDetailPage";
import { JobApplyPage } from "./pages/jobs/JobApplyPage";
import { MyJobsPage } from "./pages/recruiter/MyJobsPage";
import { JobEditPage } from "./pages/recruiter/JobEditPage";
import { JobInboxPage } from "./pages/recruiter/JobInboxPage";
import { RecruiterJobBoardPage } from "./pages/recruiter/JobBoardPage";
import { RecruiterApplicationDetailPage } from "./pages/recruiter/ApplicationDetailPage";
import { RecruiterInboxPage } from "./pages/recruiter/InboxPage";
import { InboxPage } from "./pages/inbox/InboxPage";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (user) {
    return <Navigate to={user.role === "RECRUITER" ? "/recruiter/jobs" : "/dashboard"} replace />;
  }
  return <>{children}</>;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!user) return <Navigate to="/jobs" replace />;
  return <Navigate to={user.role === "RECRUITER" ? "/recruiter/jobs" : "/dashboard"} replace />;
}

function PublicWithOptionalShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (user) return <AppShell>{children}</AppShell>;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
      <Route path="/" element={<HomeRedirect />} />

      {/* Public job board (visible to logged-out users; logged-in users see the shell) */}
      <Route path="/jobs" element={<PublicWithOptionalShell><JobBoardPage /></PublicWithOptionalShell>} />
      <Route path="/jobs/:id" element={<PublicWithOptionalShell><JobDetailPage /></PublicWithOptionalShell>} />

      {/* Applicant-only */}
      <Route
        path="/jobs/:id/apply"
        element={
          <Protected>
            <RequireRole role="APPLICANT">
              <JobApplyPage />
            </RequireRole>
          </Protected>
        }
      />
      <Route path="/dashboard" element={<Protected><RequireRole role="APPLICANT"><DashboardPage /></RequireRole></Protected>} />
      <Route path="/inbox" element={<Protected><RequireRole role="APPLICANT"><InboxPage /></RequireRole></Protected>} />
      <Route path="/applications" element={<Protected><RequireRole role="APPLICANT"><ApplicationsPage /></RequireRole></Protected>} />
      <Route path="/applications/new" element={<Protected><RequireRole role="APPLICANT"><NewApplicationPage /></RequireRole></Protected>} />
      <Route path="/applications/:id" element={<Protected><RequireRole role="APPLICANT"><ApplicationDetailPage /></RequireRole></Protected>} />
      <Route path="/board" element={<Protected><RequireRole role="APPLICANT"><BoardPage /></RequireRole></Protected>} />

      {/* Recruiter-only */}
      <Route path="/recruiter/inbox" element={<Protected><RequireRole role="RECRUITER"><RecruiterInboxPage /></RequireRole></Protected>} />
      <Route path="/recruiter/jobs" element={<Protected><RequireRole role="RECRUITER"><MyJobsPage /></RequireRole></Protected>} />
      <Route path="/recruiter/jobs/new" element={<Protected><RequireRole role="RECRUITER"><JobEditPage /></RequireRole></Protected>} />
      <Route path="/recruiter/jobs/:id/edit" element={<Protected><RequireRole role="RECRUITER"><JobEditPage /></RequireRole></Protected>} />
      <Route path="/recruiter/jobs/:id/inbox" element={<Protected><RequireRole role="RECRUITER"><JobInboxPage /></RequireRole></Protected>} />
      <Route path="/recruiter/jobs/:id/board" element={<Protected><RequireRole role="RECRUITER"><RecruiterJobBoardPage /></RequireRole></Protected>} />
      <Route path="/recruiter/applications/:id" element={<Protected><RequireRole role="RECRUITER"><RecruiterApplicationDetailPage /></RequireRole></Protected>} />

      <Route path="*" element={<div className="p-8">404</div>} />
    </Routes>
  );
}
