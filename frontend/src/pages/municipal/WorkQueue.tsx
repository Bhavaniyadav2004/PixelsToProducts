import { useSearchParams } from "react-router-dom";
import IncidentCard from "../../components/IncidentCard";
import { PageTitle } from "../../components/Layout";
import { Loading } from "../../components/StatCard";
import { useFetch } from "../../hooks/useFetch";
import { Incident } from "../../types";
import { fmtDate, pretty } from "../../utils/format";

const STATUSES = ["ASSIGNED", "IN_PROGRESS", "AWAITING_VERIFICATION", "REQUIRES_REVIEW", "RESOLVED"];
const TYPES = ["POTHOLE", "ROAD_CRACK", "WATERLOGGING", "BROKEN_FOOTPATH", "DAMAGED_MANHOLE", "DAMAGED_SIGN", "BROKEN_STREETLIGHT", "OTHER"];

export default function WorkQueue() {
  const [sp, setSp] = useSearchParams();
  const params = Object.fromEntries(sp.entries());
  const { data, error } = useFetch<Incident[]>("/municipal/work-orders", params);
  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp);
    v ? n.set(k, v) : n.delete(k);
    setSp(n);
  };
  const Select = ({ k, label, opts }: { k: string; label: string; opts: string[] }) => (
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
      <PageTitle title="Work Queue" />
      <div className="card mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Select k="priority" label="Priority" opts={["CRITICAL", "HIGH", "MEDIUM", "LOW"]} />
        <Select k="status" label="Status" opts={STATUSES} />
        <Select k="due" label="Due date" opts={["today", "week"]} />
        <Select k="issue_type" label="Issue type" opts={TYPES} />
      </div>
      {!data ? <Loading error={error} /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.map((i) => (
            <IncidentCard key={i.id} incident={i} to={`/municipal/work/${i.id}`}
              footer={<span className="text-xs text-slate-500">Due {fmtDate(i.due_date)}</span>} />
          ))}
        </div>
      )}
      {data && !data.length && <p className="text-slate-500">No work orders match these filters.</p>}
    </>
  );
}
