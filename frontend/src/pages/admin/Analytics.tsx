import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageTitle } from "../../components/Layout";
import { Loading, StatCard } from "../../components/StatCard";
import { useFetch } from "../../hooks/useFetch";
import { pretty, sevColor } from "../../utils/format";

type Pt = { name: string; value: number };
interface A {
  by_type: Pt[];
  by_severity: Pt[];
  open_vs_resolved: Pt[];
  verification_outcomes: Pt[];
  final_outcomes: Pt[];
  department_workload: { name: string; open: number; resolved: number }[];
  recurring: { street_name: string; street_slug: string; issue_type: string; incidents: number; span_days: number; codes: string[] }[];
  avg_resolution_days: number | null;
  resolved_count: number;
}

const PALETTE = ["#6366f1", "#f97316", "#10b981", "#eab308", "#ec4899", "#14b8a6", "#8b5cf6", "#64748b"];

function Chart({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <section className="card"><h2 className="mb-3 font-bold">{title}</h2><div style={{ height: 260 }}><ResponsiveContainer>{children}</ResponsiveContainer></div></section>
  );
}

const Pie1 = ({ data }: { data: Pt[] }) => (
  <PieChart>
    <Pie data={data.map((d) => ({ ...d, name: pretty(d.name) }))} dataKey="value" nameKey="name" outerRadius={90} label>
      {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
    </Pie>
    <Tooltip /><Legend />
  </PieChart>
);

export default function Analytics() {
  const { data: a, error } = useFetch<A>("/admin/analytics");
  if (!a) return <Loading error={error} />;
  return (
    <>
      <PageTitle title="Analytics" />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Avg resolution time" value={a.avg_resolution_days !== null ? `${a.avg_resolution_days} days` : "-"} />
        <StatCard label="Resolved incidents" value={a.resolved_count} tone="green" />
        <StatCard label="Recurring clusters" value={a.recurring.length} tone="orange" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Chart title="Incidents by issue type">
          <BarChart data={a.by_type.map((d) => ({ ...d, name: pretty(d.name) }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} interval={0} angle={-20} height={60} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#6366f1" /></BarChart>
        </Chart>
        <Chart title="Incidents by severity">
          <BarChart data={a.by_severity}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value">{a.by_severity.map((d) => <Cell key={d.name} fill={sevColor[d.name]} />)}</Bar></BarChart>
        </Chart>
        <Chart title="Open vs resolved"><Pie1 data={a.open_vs_resolved} /></Chart>
        <Chart title="Repair verification outcomes (AI)"><Pie1 data={a.verification_outcomes} /></Chart>
        <Chart title="Department workload">
          <BarChart data={a.department_workload}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="open" stackId="a" fill="#f97316" /><Bar dataKey="resolved" stackId="a" fill="#10b981" /></BarChart>
        </Chart>
        <Chart title="Final outcomes"><Pie1 data={a.final_outcomes} /></Chart>
      </div>
      <section className="card mt-5">
        <h2 className="mb-3 font-bold">Possible recurring infrastructure problems</h2>
        {!a.recurring.length && <p className="text-sm text-slate-500">None detected.</p>}
        <ul className="space-y-2 text-sm">
          {a.recurring.map((r) => (
            <li key={r.codes.join()} className="rounded-lg bg-orange-50 p-3">
              <b>{pretty(r.issue_type)}</b> on <Link className="text-indigo-600" to={`/street/${r.street_slug}`}>{r.street_name}</Link>: {r.incidents} incidents over {r.span_days} days ({r.codes.join(", ")}). Root cause not determined.
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
