import { Link, useParams } from "react-router-dom";
import { Loading } from "../components/StatCard";
import { useFetch } from "../hooks/useFetch";
import { Incident } from "../types";
import { fmtDate, pretty } from "../utils/format";
import { StatusBadge } from "../components/StatusBadge";
import Timeline from "../components/Timeline";

interface Street {
  street_name: string;
  condition: string;
  condition_note: string;
  total_incidents: number;
  resolved_incidents: number;
  recurring_incidents: number;
  incidents: Incident[];
}

const TONE: Record<string, string> = { GOOD: "text-emerald-600", FAIR: "text-amber-600", POOR: "text-rose-600" };

export default function StreetPage() {
  const { streetId } = useParams();
  const { data: s, error } = useFetch<Street>(`/streets/${streetId}`);
  if (!s) return <div className="p-6"><Loading error={error} /></div>;
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <Link to="/" className="text-sm text-indigo-600">&larr; Back</Link>
      <h1 className="mt-2 text-3xl font-extrabold uppercase">{s.street_name}</h1>
      <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card"><div className="label">Current condition</div><div className={`text-2xl font-bold ${TONE[s.condition]}`}>{s.condition}</div></div>
        <div className="card"><div className="label">Total issues</div><div className="text-2xl font-bold">{s.total_incidents}</div></div>
        <div className="card"><div className="label">Resolved</div><div className="text-2xl font-bold">{s.resolved_incidents}</div></div>
        <div className="card"><div className="label">Recurring</div><div className="text-2xl font-bold">{s.recurring_incidents}</div></div>
      </div>
      <p className="mb-6 text-xs text-slate-500">{s.condition_note}</p>

      <h2 className="mb-3 text-lg font-bold">Visual history</h2>
      <div className="space-y-6">
        {s.incidents.map((i) => (
          <section key={i.id} className="card">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold">{i.incident_code}</span>
              <StatusBadge status={i.status} />
              <span className="text-sm text-slate-600">{pretty(i.issue_type)} - {fmtDate(i.first_reported_at)}</span>
              {i.recurring && <span className="text-xs font-semibold text-orange-600">RECURRING</span>}
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              {(i.media ?? []).map((m) => (
                <figure key={m.id} className="w-44 shrink-0">
                  <img src={m.thumbnail_url ?? m.url} alt="" loading="lazy" className="h-32 w-44 rounded-lg object-cover" />
                  <figcaption className="mt-1 text-xs text-slate-500">{pretty(m.media_role.replace("REPAIR_", "").replace("CITIZEN_REPORT", "Reported"))} - {fmtDate(m.created_at)}</figcaption>
                </figure>
              ))}
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-indigo-600">Full timeline</summary>
              <div className="mt-4"><Timeline events={i.timeline ?? []} /></div>
            </details>
            <Link to={`/incident/${i.id}`} className="mt-2 inline-block text-sm text-indigo-600">Open incident &rarr;</Link>
          </section>
        ))}
      </div>
    </div>
  );
}
