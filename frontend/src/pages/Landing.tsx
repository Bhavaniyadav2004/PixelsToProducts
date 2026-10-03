import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { homeFor } from "../utils/format";

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to={homeFor(user.role)} replace />;
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">Report road problems in Bengaluru and see them get fixed</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">Upload a photo of a pothole, waterlogged stretch or broken footpath. Reports at the same spot are grouped into one issue, assigned to a municipal team, and closed only after the repair is checked and you confirm it.</p>
        <div className="mt-8 flex gap-3">
          <Link to="/login" className="btn bg-white px-6 py-3 text-base text-slate-900 hover:bg-slate-200">Sign in</Link>
          <Link to="/login?register=1" className="btn border border-slate-500 px-6 py-3 text-base text-white hover:bg-slate-800">Create citizen account</Link>
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            ["Citizens", "Capture a photo or video, get AI-assisted classification, track the repair, and confirm it actually worked."],
            ["Municipal teams", "Work orders with evidence, priority reasons and a simple repair workflow with before/during/after uploads."],
            ["Admins", "City-wide map, explainable priority queue, assignment, verification review and analytics."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-md border border-slate-700 p-5">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-slate-400">{d}</p>
            </div>
          ))}
        </div>
        <footer className="mt-20 border-t border-slate-700 pt-4 text-xs text-slate-400">
          <Link className="hover:underline" to="/privacy">Privacy policy</Link>
          <span className="mx-2">|</span>
          <Link className="hover:underline" to="/terms">Terms and conditions</Link>
        </footer>
      </div>
    </div>
  );
}
