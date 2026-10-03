import { ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { homeFor, pretty } from "../utils/format";

const NAV: Record<string, [string, string][]> = {
  CITIZEN: [["/citizen", "Home"], ["/citizen/report", "Report an issue"], ["/citizen/reports", "My reports"], ["/citizen/nearby", "Nearby issues"]],
  MUNICIPAL_MEMBER: [["/municipal", "Dashboard"], ["/municipal/work", "My work"], ["/municipal/work?status=IN_PROGRESS", "In progress"], ["/municipal/work?status=AWAITING_VERIFICATION", "Awaiting verification"]],
  ADMIN: [["/admin", "Overview"], ["/admin/incidents", "Incidents"], ["/admin/verification", "Verification"], ["/admin/analytics", "Analytics"], ["/admin/users", "Users"]],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  if (!user) return null;
  return (
    <div className="min-h-screen">
      <header className="app-header">
        <div className="landing-container app-topbar">
          <Link to={homeFor(user.role)} className="landing-brand">StreetPulse<span className="landing-brand-dot" aria-hidden="true" /></Link>
          <div className="app-account">
            <span>{user.name} <span className="text-gray-500">({pretty(user.role)})</span></span>
            <button className="underline-offset-2 hover:underline" onClick={() => { logout(); nav("/"); }}>Sign out</button>
          </div>
        </div>
        <nav className="app-navigation" aria-label="Main navigation">
          <div className="landing-container app-nav-links">
            {NAV[user.role].map(([to, label]) => (
              <NavLink key={to} to={to} end={to.split("/").length <= 2}
                className={({ isActive }) => `app-nav-link ${isActive && !to.includes("?") ? "active" : ""}`}>
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>
      <main className="landing-container app-main"><Outlet /></main>
    </div>
  );
}

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="page-title mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-gray-300 pb-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-gray-600">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
