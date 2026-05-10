import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  Kanban,
  LogOut,
  Briefcase,
  Inbox,
  Sparkles,
  Menu,
  X,
  Bookmark,
  TrendingUp,
  Users,
  UserCircle2,
  MessageSquare,
  Search as SearchIcon,
  Library,
} from "lucide-react";
import type { Role } from "@smartjob/shared";
import { useAuth } from "../lib/auth";
import { useUnreadCount } from "../api/chat";
import { cn } from "../lib/cn";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };

type NavItemWithBadge = NavItem & { badge?: number };

const applicantNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/applications", label: "Applications", icon: ListChecks },
  { to: "/board", label: "Board", icon: Kanban },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/jobs", label: "Job board", icon: Briefcase },
  { to: "/profile", label: "Profile", icon: UserCircle2 },
];

const recruiterNav: NavItem[] = [
  { to: "/recruiter/inbox", label: "Inbox", icon: Inbox },
  { to: "/recruiter/discover", label: "Discover", icon: SearchIcon },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/recruiter/funnel", label: "Funnel", icon: TrendingUp },
  { to: "/recruiter/jobs", label: "My jobs", icon: Briefcase },
  { to: "/jobs", label: "Job board", icon: Kanban },
];

const adminExtras: NavItem[] = [
  { to: "/recruiter/team", label: "Team", icon: Users },
  { to: "/recruiter/team/threads", label: "Team threads", icon: Library },
];

const navFor = (
  role: Role | undefined,
  membership: "PENDING" | "APPROVED" | "ADMIN" | null | undefined,
): NavItem[] => {
  if (role !== "RECRUITER") return applicantNav;
  return membership === "ADMIN" ? [...recruiterNav, ...adminExtras] : recruiterNav;
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const nav = navFor(user?.role, user?.companyMembership);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer when the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the drawer is open on mobile.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Desktop sidebar (md+) — sticky, doesn't scroll with main ── */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:flex">
        <SidebarContents nav={nav} />
      </aside>

      {/* ── Mobile drawer overlay ──────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setDrawerOpen(false)}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-out md:hidden dark:border-slate-800 dark:bg-slate-950",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Navigation"
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <Logo />
          <button
            onClick={() => setDrawerOpen(false)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <SidebarContents nav={nav} hideLogo />
      </aside>

      {/* ── Main column ───────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <Logo />
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────── */

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
        <Sparkles size={16} strokeWidth={2.5} />
      </span>
      <span className="text-base font-semibold tracking-tight">Smart Job</span>
    </Link>
  );
}

function SidebarContents({
  nav,
  hideLogo = false,
}: {
  nav: NavItem[];
  hideLogo?: boolean;
}) {
  const { user, logout } = useAuth();
  const { data: unread } = useUnreadCount();
  const unreadCount = unread?.unread ?? 0;

  return (
    <>
      {!hideLogo && (
        <div className="px-4 pt-5">
          <Logo />
          {user?.company && (
            <div className="mt-1 ml-10 text-xs text-slate-500">{user.company.name}</div>
          )}
        </div>
      )}

      {/* Nav — flex-1 + overflow so it scrolls if it ever gets long */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="flex flex-col gap-0.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                  )
                }
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {to === "/messages" && unreadCount > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer with user info — pinned at bottom */}
      <div className="shrink-0 border-t border-slate-200 px-4 py-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {(user?.name ?? "?")
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{user?.name}</div>
            <div className="truncate text-[11px] text-slate-500">{user?.email}</div>
          </div>
        </div>
        {user?.role && (
          <div className="mt-2 flex flex-wrap gap-1">
            <span
              className={cn(
                "pill",
                user.role === "RECRUITER"
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
              )}
            >
              {user.role}
            </span>
            {user.companyMembership === "ADMIN" && (
              <span className="pill bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                ADMIN
              </span>
            )}
            {user.companyMembership === "PENDING" && (
              <span className="pill bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                PENDING
              </span>
            )}
          </div>
        )}
        <button
          onClick={() => void logout()}
          className="btn-ghost mt-3 w-full justify-start"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </>
  );
}
