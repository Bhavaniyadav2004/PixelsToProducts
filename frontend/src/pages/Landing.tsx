import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { homeFor } from "../utils/format";

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to={homeFor(user.role)} replace />;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight">StreetPulse</h1>
        <p className="mt-4 text-xl text-indigo-200">Every street has a visual memory.</p>
        <p className="mt-2 text-indigo-300">A complaint is a moment. A visual timeline is accountability.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/login" className="btn btn-primary px-6 py-3 text-base">Sign in</Link>
          <Link to="/login?register=1" className="btn bg-white/10 px-6 py-3 text-base text-white hover:bg-white/20">Create citizen account</Link>
        </div>
        <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
          {[
            ["Citizens", "Capture a photo or video, get AI-assisted classification, track the repair, and confirm it actually worked."],
            ["Municipal teams", "Work orders with evidence, priority reasons and a simple repair workflow with before/during/after uploads."],
            ["Admins", "City-wide map, explainable priority queue, assignment, verification review and analytics."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl bg-white/10 p-5">
              <h3 className="font-bold">{t}</h3>
              <p className="mt-2 text-sm text-indigo-100">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
