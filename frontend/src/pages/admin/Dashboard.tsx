import { Link } from "react-router-dom";
import IncidentCard from "../../components/IncidentCard";
import { PageTitle } from "../../components/Layout";
import MapView from "../../components/MapView";
import { Loading, StatCard } from "../../components/StatCard";
import { useFetch } from "../../hooks/useFetch";
import { Incident } from "../../types";

interface Dash {
  total: number;
  by_severity: Record<string, number>;
  in_progress: number;
  awaiting_verification: number;
  resolved: number;
  unassigned: number;
  priority_queue: Incident[];
  map: Incident[];
}

export default function AdminDashboard() {
  const { data: d, error } = useFetch<Dash>("/admin/dashboard");
  if (!d) return <Loading error={error} />;
  return (
    <>
      <PageTitle title="City Overview" />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <StatCard label="Total issues" value={d.total} />
        <StatCard label="Critical" value={d.by_severity.CRITICAL} tone="red" />
        <StatCard label="High" value={d.by_severity.HIGH} tone="orange" />
        <StatCard label="Medium" value={d.by_severity.MEDIUM} tone="amber" />
        <StatCard label="Unassigned" value={d.unassigned} tone="indigo" />
        <StatCard label="In progress" value={d.in_progress} tone="amber" />
        <StatCard label="Awaiting review" value={d.awaiting_verification} tone="purple" />
        <StatCard label="Resolved" value={d.resolved} tone="green" />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <section className="card xl:col-span-2">
          <h2 className="mb-3 font-bold">City map</h2>
          <MapView incidents={d.map} height={440} linkPrefix="/admin/incidents" />
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Priority queue</h2><Link className="text-sm text-indigo-600" to="/admin/incidents">View all</Link></div>
          <div className="space-y-3">
            {d.priority_queue.map((i) => <IncidentCard key={i.id} incident={i} to={`/admin/incidents/${i.id}`} />)}
          </div>
        </section>
      </div>
    </>
  );
}
