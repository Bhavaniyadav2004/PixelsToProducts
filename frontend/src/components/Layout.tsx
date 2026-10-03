import { ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { homeFor } from "../utils/format";

const NAV: Record<string, [string, string][]> = {
  CITIZEN: [["/citizen", "Home"], ["/citizen/report", "Report Issue"], ["/citizen/reports", "My Reports"], ["/citizen/nearby", "Nearby Issues"]],
  MUNICIPAL_MEMBER: [["/municipal", "Dashboard"], ["/municipal/work", "My Work"], ["/municipal/work?status=IN_PROGRESS", "In Progress"], ["/municipal/work?status=AWAITING_VERIFICATION", "Awaiting Verification"]],
  ADMIN: [["/admin", "Overview"], ["/admin/incidents", "Incidents"], ["/admin/verification", "Verification"], ["/admin/analytics", "Analytics"], ["/admin/users", "Users"]],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  if (!user) return null;
  const accent = "bg-slate-900";
  const roleLabel = user.role === "ADMIN" ? "Administrator" : user.role === "MUNICIPAL_MEMBER" ? "Municipal staff" : "Citizen";
  return (
    <div className="min-h-screen">
      <header className={`${accent} text-white`}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to={homeFor(user.role)} className="text-lg font-semibold tracking-tight">StreetPulse</Link>
          <nav className="flex flex-1 flex-wrap gap-1 text-sm">
            {NAV[user.role].map(([to, label]) => (
              <NavLink key={to} to={to} end={to.split("/").length <= 2} className={({ isActive }) => `px-3 py-1.5 border-b-2 ${isActive && !to.includes("?") ? "border-white" : "border-transparent text-slate-300 hover:text-white"}`}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="opacity-80">{user.name} <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-xs">{roleLabel}</span></span>
            <button className="rounded-md bg-white/15 px-3 py-1.5 hover:bg-white/25" onClick={() => { logout(); nav("/"); }}>Log out</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4 sm:p-6"><Outlet /></main>
      <footer className="mx-auto max-w-7xl border-t border-slate-200 px-4 py-4 text-xs text-slate-500 sm:px-6">
        <Link className="hover:underline" to="/privacy">Privacy policy</Link>
        <span className="mx-2">|</span>
        <Link className="hover:underline" to="/terms">Terms and conditions</Link>
      </footer>
    </div>
  );
}

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {sub && <p className="text-sm text-slate-500">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
