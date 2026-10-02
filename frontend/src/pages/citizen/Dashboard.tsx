import { Link } from "react-router-dom";
import IncidentCard from "../../components/IncidentCard";
import { PageTitle } from "../../components/Layout";
import MapView from "../../components/MapView";
import { Loading, StatCard } from "../../components/StatCard";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { Incident } from "../../types";

export interface MyReport { id: number; description: string | null; created_at: string; incident: Incident }

export default function CitizenDashboard() {
  const { user } = useAuth();
  const mine = useFetch<MyReport[]>("/reports/my");
  const all = useFetch<Incident[]>("/incidents");
  if (!mine.data || !all.data) return <Loading error={mine.error || all.error} />;

  const incidents = [...new Map(mine.data.map((r) => [r.incident.id, r.incident])).values()];
  const open = incidents.filter((i) => i.status !== "RESOLVED").length;
  const needsConfirm = mine.data.filter((r) => r.incident.status === "AWAITING_VERIFICATION");

  return (
    <>
      <PageTitle title={`Hello, ${user?.name}`} right={<Link to="/citizen/report" className="btn btn-primary">+ Report an Issue</Link>} />
      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatCard label="My reports" value={mine.data.length} />
        <StatCard label="Open issues" value={open} tone="orange" />
        <StatCard label="Resolved" value={incidents.length - open} tone="green" />
      </div>
      {needsConfirm.length > 0 && (
        <div className="mb-5 rounded-xl border border-purple-200 bg-purple-50 p-4">
          <b className="text-purple-800">Repair ready for your confirmation</b>
          <div className="mt-2 flex flex-wrap gap-2">
            {needsConfirm.map((r) => <Link key={r.id} className="btn btn-primary" to={`/citizen/reports/${r.id}`}>{r.incident.incident_code}: review before/after</Link>)}
          </div>
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card"><h2 className="mb-3 font-bold">Nearby issues</h2><MapView incidents={all.data} linkPrefix="/incident" /></section>
        <section>
          <h2 className="mb-3 font-bold">Recent reports</h2>
          <div className="space-y-3">
            {mine.data.slice(0, 4).map((r) => <IncidentCard key={r.id} incident={r.incident} to={`/citizen/reports/${r.id}`} />)}
            {!mine.data.length && <p className="text-sm text-slate-500">You haven't reported anything yet.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
