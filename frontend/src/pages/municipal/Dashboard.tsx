import { Link } from "react-router-dom";
import IncidentCard from "../../components/IncidentCard";
import { PageTitle } from "../../components/Layout";
import { Loading, StatCard } from "../../components/StatCard";
import { useFetch } from "../../hooks/useFetch";
import { Incident } from "../../types";

export default function MunicipalDashboard() {
  const stats = useFetch<Record<string, number>>("/municipal/dashboard");
  const work = useFetch<Incident[]>("/municipal/work-orders");
  if (!stats.data || !work.data) return <Loading error={stats.error || work.error} />;
  const s = stats.data;
  return (
    <>
      <PageTitle title="My Work" right={<Link className="btn btn-ghost" to="/municipal/work">Open work queue</Link>} />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="My assignments" value={s.assigned} tone="indigo" />
        <StatCard label="In progress" value={s.in_progress} tone="amber" />
        <StatCard label="Due today" value={s.due_today} tone="red" />
        <StatCard label="Awaiting verification" value={s.awaiting_verification} tone="purple" />
      </div>
      <h2 className="mb-3 font-bold">Highest priority</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {work.data.slice(0, 6).map((i) => (
          <IncidentCard key={i.id} incident={i} footer={<Link className="btn btn-primary" to={`/municipal/work/${i.id}`}>Open Work Order</Link>} />
        ))}
      </div>
      {!work.data.length && <p className="text-slate-500">No open work orders.</p>}
    </>
  );
}
