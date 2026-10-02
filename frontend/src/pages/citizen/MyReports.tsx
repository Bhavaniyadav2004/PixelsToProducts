import IncidentCard from "../../components/IncidentCard";
import { PageTitle } from "../../components/Layout";
import { Loading } from "../../components/StatCard";
import { useFetch } from "../../hooks/useFetch";
import { MyReport } from "./Dashboard";

export default function MyReports() {
  const { data, error } = useFetch<MyReport[]>("/reports/my");
  if (!data) return <Loading error={error} />;
  return (
    <>
      <PageTitle title="My Reports" />
      <div className="grid gap-3 md:grid-cols-2">
        {data.map((r) => <IncidentCard key={r.id} incident={r.incident} to={`/citizen/reports/${r.id}`} />)}
      </div>
      {!data.length && <p className="text-slate-500">No reports yet.</p>}
    </>
  );
}
