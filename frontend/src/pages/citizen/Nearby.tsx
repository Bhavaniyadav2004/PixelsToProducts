import { useEffect, useState } from "react";
import IncidentCard from "../../components/IncidentCard";
import { PageTitle } from "../../components/Layout";
import MapView from "../../components/MapView";
import { Loading } from "../../components/StatCard";
import { useFetch } from "../../hooks/useFetch";
import { Incident } from "../../types";

const dist = (a: [number, number], i: Incident) => Math.hypot(a[0] - i.latitude, a[1] - i.longitude);

export default function Nearby() {
  const { data, error } = useFetch<Incident[]>("/incidents");
  const [pos, setPos] = useState<[number, number] | null>(null);
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((p) => setPos([p.coords.latitude, p.coords.longitude]), () => {});
  }, []);
  if (!data) return <Loading error={error} />;
  const sorted = pos ? [...data].sort((a, b) => dist(pos, a) - dist(pos, b)) : data;
  return (
    <>
      <PageTitle title="Nearby Issues" sub={pos ? "Sorted by distance from you" : "Allow location access to sort by distance"} />
      <div className="card mb-5"><MapView incidents={data} height={420} linkPrefix="/incident" /></div>
      <div className="grid gap-3 md:grid-cols-2">
        {sorted.slice(0, 12).map((i) => <IncidentCard key={i.id} incident={i} to={`/incident/${i.id}`} />)}
      </div>
    </>
  );
}
