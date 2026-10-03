import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { homeFor } from "../utils/format";

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to={homeFor(user.role)} replace />;
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-brand-600 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold">StreetPulse</span>
          <Link to="/login" className="text-sm hover:underline">Sign in</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="max-w-2xl text-3xl font-semibold text-gray-900">Report road and street problems, and see them fixed.</h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Report a pothole, broken footpath or waterlogging with a photo. Each issue keeps a full photo history from first report to repair,
          so you can check whether the work was actually done.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/login?register=1" className="btn btn-primary">Create an account</Link>
          <Link to="/login" className="btn btn-ghost">Sign in</Link>
        </div>

        <h2 className="mt-14 border-b border-gray-300 pb-2 text-lg font-semibold">How it works</h2>
        <ol className="mt-4 grid gap-6 sm:grid-cols-3">
          {[
            ["1. Report", "Take a photo or video and share your location. Reports about the same problem nearby are combined into one incident."],
            ["2. Repair", "The issue is assigned to a municipal team, who upload before, during and after photos as the work progresses."],
            ["3. Confirm", "After the repair is checked, you confirm whether the road actually looks fixed before the issue is closed."],
          ].map(([t, d]) => (
            <li key={t}>
              <h3 className="font-semibold text-gray-900">{t}</h3>
              <p className="mt-1 text-sm text-gray-600">{d}</p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
