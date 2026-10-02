import { useParams } from "react-router-dom";
import { PageTitle } from "../components/Layout";
import IncidentView from "../components/IncidentView";
import { Loading } from "../components/StatCard";
import { useAuth } from "../hooks/useAuth";
import { useFetch } from "../hooks/useFetch";
import { Incident } from "../types";

/** Read-only incident page, shared by all roles. */
export default function IncidentPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, error } = useFetch<Incident>(`/incidents/${id}`);
  if (!data) return <Loading error={error} />;
  return (
    <>
      <PageTitle title="Incident details" />
      <IncidentView incident={data} showPriority={user?.role !== "CITIZEN"} />
    </>
  );
}
