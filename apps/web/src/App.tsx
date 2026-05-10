import { Navigate, Route, Routes } from "react-router-dom";
import {
  RequireApprovedRecruiter,
  RequireCompanyAdmin,
  RequireRole,
  useAuth,
} from "./lib/auth";
import { AppShell } from "./components/AppShell";
import { useRealtime } from "./api/realtime";
import { LoginPage } from "./pages/login/LoginPage";
import { RegisterPage } from "./pages/register/RegisterPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ApplicationsPage } from "./pages/applications/ApplicationsPage";
import { ApplicationDetailPage } from "./pages/applications/ApplicationDetailPage";
import { NewApplicationPage } from "./pages/applications/NewApplicationPage";
import { BoardPage } from "./pages/board/BoardPage";
import { JobBoardPage } from "./pages/jobs/JobBoardPage";
import { JobDetailPage } from "./pages/jobs/JobDetailPage";
import { JobApplyPage } from "./pages/jobs/JobApplyPage";
import { SavedJobsPage } from "./pages/saved/SavedJobsPage";
import { CompanyProfilePage } from "./pages/companies/CompanyProfilePage";
import { MyJobsPage } from "./pages/recruiter/MyJobsPage";
import { JobEditPage } from "./pages/recruiter/JobEditPage";
import { JobInboxPage } from "./pages/recruiter/JobInboxPage";
import { RecruiterJobBoardPage } from "./pages/recruiter/JobBoardPage";
import { RecruiterApplicationDetailPage } from "./pages/recruiter/ApplicationDetailPage";
import { RecruiterInboxPage } from "./pages/recruiter/InboxPage";
import { RecruiterFunnelPage } from "./pages/recruiter/FunnelPage";
import { TeamPage } from "./pages/recruiter/TeamPage";
import { DiscoverPage } from "./pages/recruiter/DiscoverPage";
import { ApplicantDetailPageRecruiter } from "./pages/recruiter/ApplicantDetailPageRecruiter";
import { TeamThreadsPage, TeamThreadDetailPage } from "./pages/recruiter/TeamThreadsPage";
import { MessagesListPage } from "./pages/messages/MessagesListPage";
import { MessageThreadPage } from "./pages/messages/MessageThreadPage";
import { InboxPage } from "./pages/inbox/InboxPage";
import { ProfilePage } from "./pages/profile/ProfilePage";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  useRealtime(!!user);
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (user) {
    return <Navigate to={user.role === "RECRUITER" ? "/recruiter/inbox" : "/dashboard"} replace />;
  }
  return <>{children}</>;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!user) return <Navigate to="/jobs" replace />;
  return <Navigate to={user.role === "RECRUITER" ? "/recruiter/inbox" : "/dashboard"} replace />;
}

function PublicWithOptionalShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  useRealtime(!!user);
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (user) return <AppShell>{children}</AppShell>;
  return <>{children}</>;
}

const recruiterRoute = (page: React.ReactNode) => (
  <Protected>
    <RequireRole role="RECRUITER">
      <RequireApprovedRecruiter>{page}</RequireApprovedRecruiter>
    </RequireRole>
  </Protected>
);

const adminRoute = (page: React.ReactNode) => (
  <Protected>
    <RequireRole role="RECRUITER">
      <RequireCompanyAdmin>{page}</RequireCompanyAdmin>
    </RequireRole>
  </Protected>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/jobs" element={<PublicWithOptionalShell><JobBoardPage /></PublicWithOptionalShell>} />
      <Route path="/jobs/:id" element={<PublicWithOptionalShell><JobDetailPage /></PublicWithOptionalShell>} />
      <Route path="/c/:id" element={<PublicWithOptionalShell><CompanyProfilePage /></PublicWithOptionalShell>} />

      <Route path="/jobs/:id/apply" element={<Protected><RequireRole role="APPLICANT"><JobApplyPage /></RequireRole></Protected>} />
      <Route path="/dashboard" element={<Protected><RequireRole role="APPLICANT"><DashboardPage /></RequireRole></Protected>} />
      <Route path="/inbox" element={<Protected><RequireRole role="APPLICANT"><InboxPage /></RequireRole></Protected>} />
      <Route path="/applications" element={<Protected><RequireRole role="APPLICANT"><ApplicationsPage /></RequireRole></Protected>} />
      <Route path="/applications/new" element={<Protected><RequireRole role="APPLICANT"><NewApplicationPage /></RequireRole></Protected>} />
      <Route path="/applications/:id" element={<Protected><RequireRole role="APPLICANT"><ApplicationDetailPage /></RequireRole></Protected>} />
      <Route path="/board" element={<Protected><RequireRole role="APPLICANT"><BoardPage /></RequireRole></Protected>} />
      <Route path="/saved" element={<Protected><RequireRole role="APPLICANT"><SavedJobsPage /></RequireRole></Protected>} />
      <Route path="/profile" element={<Protected><RequireRole role="APPLICANT"><ProfilePage /></RequireRole></Protected>} />

      <Route path="/messages" element={<Protected><MessagesListPage /></Protected>} />
      <Route path="/messages/:id" element={<Protected><MessageThreadPage /></Protected>} />

      <Route path="/recruiter/discover" element={recruiterRoute(<DiscoverPage />)} />
      <Route path="/recruiter/applicants/:id" element={recruiterRoute(<ApplicantDetailPageRecruiter />)} />
      <Route path="/recruiter/team/threads" element={adminRoute(<TeamThreadsPage />)} />
      <Route path="/recruiter/team/threads/:id" element={adminRoute(<TeamThreadDetailPage />)} />
      <Route path="/recruiter/inbox" element={recruiterRoute(<RecruiterInboxPage />)} />
      <Route path="/recruiter/funnel" element={recruiterRoute(<RecruiterFunnelPage />)} />
      <Route path="/recruiter/jobs" element={recruiterRoute(<MyJobsPage />)} />
      <Route path="/recruiter/jobs/new" element={recruiterRoute(<JobEditPage />)} />
      <Route path="/recruiter/jobs/:id/edit" element={recruiterRoute(<JobEditPage />)} />
      <Route path="/recruiter/jobs/:id/inbox" element={recruiterRoute(<JobInboxPage />)} />
      <Route path="/recruiter/jobs/:id/board" element={recruiterRoute(<RecruiterJobBoardPage />)} />
      <Route path="/recruiter/applications/:id" element={recruiterRoute(<RecruiterApplicationDetailPage />)} />
      <Route path="/recruiter/team" element={adminRoute(<TeamPage />)} />

      <Route path="*" element={<div className="p-8">404</div>} />
    </Routes>
  );
}
