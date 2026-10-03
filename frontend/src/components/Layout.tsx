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
      <header className="bg-brand-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
          <Link to={homeFor(user.role)} className="text-lg font-semibold">StreetPulse</Link>
          <div className="flex items-center gap-4 text-sm">
            <span>{user.name} <span className="text-white/70">({pretty(user.role)})</span></span>
            <button className="underline-offset-2 hover:underline" onClick={() => { logout(); nav("/"); }}>Sign out</button>
          </div>
        </div>
        <nav className="border-t border-white/15 bg-brand-700">
          <div className="mx-auto flex max-w-7xl flex-wrap px-4 text-sm">
            {NAV[user.role].map(([to, label]) => (
              <NavLink key={to} to={to} end={to.split("/").length <= 2}
                className={({ isActive }) => `border-b-2 px-4 py-2.5 ${isActive && !to.includes("?") ? "border-white font-medium" : "border-transparent text-white/80 hover:text-white"}`}>
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl p-4 sm:p-6"><Outlet /></main>
    </div>
  );
}

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-gray-300 pb-3">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-gray-600">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
