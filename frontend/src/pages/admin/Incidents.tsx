import { Link, useSearchParams } from "react-router-dom";
import { PageTitle } from "../../components/Layout";
import { PriorityBadge, SeverityBadge } from "../../components/PriorityBadge";
import { StatusBadge } from "../../components/StatusBadge";
import { Loading } from "../../components/StatCard";
import { useFetch } from "../../hooks/useFetch";
import { Incident } from "../../types";
import { fmtDate, pretty } from "../../utils/format";

const STATUSES = ["NEW", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "AWAITING_VERIFICATION", "REQUIRES_REVIEW", "RESOLVED"];
const TYPES = ["POTHOLE", "ROAD_CRACK", "WATERLOGGING", "BROKEN_FOOTPATH", "DAMAGED_MANHOLE", "DAMAGED_SIGN", "BROKEN_STREETLIGHT", "OTHER"];

export default function Incidents() {
  const [sp, setSp] = useSearchParams();
  const { data, error } = useFetch<Incident[]>("/admin/incidents", Object.fromEntries(sp.entries()));
  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp);
    v ? n.set(k, v) : n.delete(k);
    setSp(n);
  };
  const sel = (k: string, label: string, opts: string[]) => (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={sp.get(k) ?? ""} onChange={(e) => set(k, e.target.value)}>
        <option value="">All</option>
        {opts.map((o) => <option key={o} value={o}>{pretty(o)}</option>)}
      </select>
    </div>
  );
  return (
    <>
      <PageTitle title="Incidents" />
      <div className="card mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <div><label className="label">Search</label><input className="input" placeholder="Code or street" value={sp.get("q") ?? ""} onChange={(e) => set("q", e.target.value)} /></div>
        {sel("status", "Status", STATUSES)}
        {sel("severity", "Severity", ["CRITICAL", "HIGH", "MEDIUM", "LOW"])}
        {sel("priority_level", "Priority", ["CRITICAL", "HIGH", "MEDIUM", "LOW"])}
        {sel("issue_type", "Type", TYPES)}
      </div>
      {!data ? <Loading error={error} /> : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>{["Incident", "Type", "Street", "Severity", "Priority", "Status", "Reports", "Assigned", "Reported"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
            </thead>
            <tbody>
              {data.map((i) => (
                <tr key={i.id} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-2 font-semibold"><Link className="text-indigo-600" to={`/admin/incidents/${i.id}`}>{i.incident_code}</Link>{i.recurring && <span title="Recurring"> ⚠</span>}</td>
                  <td className="px-3 py-2">{pretty(i.issue_type)}</td>
                  <td className="px-3 py-2">{i.street_name}</td>
                  <td className="px-3 py-2"><SeverityBadge severity={i.severity} /></td>
                  <td className="px-3 py-2"><PriorityBadge level={i.priority_level} score={i.priority_score} /></td>
                  <td className="px-3 py-2"><StatusBadge status={i.status} /></td>
                  <td className="px-3 py-2">{i.report_count}</td>
                  <td className="px-3 py-2">{i.assigned_user?.name ?? "-"}</td>
                  <td className="px-3 py-2">{fmtDate(i.first_reported_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.length && <p className="p-4 text-slate-500">No incidents match.</p>}
        </div>
      )}
    </>
  );
}
