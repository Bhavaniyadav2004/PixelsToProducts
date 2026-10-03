import IncidentCard from "../../components/IncidentCard";
import { PageTitle } from "../../components/Layout";
import { Loading } from "../../components/StatCard";
import { useFetch } from "../../hooks/useFetch";
import { MyReport } from "./Dashboard";

export default function MyReports() {
  const { data, error } = useFetch<MyReport[]>("/reports/my");
  if (!data) return <Loading error={error} />;
  const mine = new Map<number, { report: MyReport; count: number }>();
  data.forEach((r) => {
    const e = mine.get(r.incident.id);
    mine.set(r.incident.id, { report: e?.report ?? r, count: (e?.count ?? 0) + 1 });
  });
  return (
    <>
      <PageTitle title="My Reports" />
      <div className="grid gap-3 md:grid-cols-2">
        {[...mine.values()].map(({ report: r, count }) => (
          <IncidentCard key={r.incident.id} incident={r.incident} to={`/citizen/reports/${r.id}`}
            footer={count > 1 ? <span className="text-xs text-slate-500">You submitted {count} reports for this incident</span> : undefined} />
        ))}
      </div>
      {!data.length && <p className="text-slate-500">No reports yet.</p>}
    </>
  );
}
