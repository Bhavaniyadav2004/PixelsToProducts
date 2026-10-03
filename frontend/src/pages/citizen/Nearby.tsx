import { useEffect, useState } from "react";
import IncidentCard from "../../components/IncidentCard";
import { PageTitle } from "../../components/Layout";
import MapView from "../../components/MapView";
import { Loading } from "../../components/StatCard";
import { useFetch } from "../../hooks/useFetch";
import { Incident } from "../../types";

const dist = (a: [number, number], i: Incident) => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(i.latitude - a[0]);
  const dLon = rad(i.longitude - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(i.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

export default function Nearby() {
  const { data, error } = useFetch<Incident[]>("/incidents");
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [locErr, setLocErr] = useState("");
  const locate = () => {
    setLocErr("");
    if (!navigator.geolocation) return setLocErr("This browser does not support location.");
    navigator.geolocation.getCurrentPosition(
      (p) => setPos([p.coords.latitude, p.coords.longitude]),
      (e) => setLocErr(e.code === 1 ? "Location permission is blocked. Allow it in the browser's site settings and retry." : "Could not determine your location."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  useEffect(locate, []);
  if (!data) return <Loading error={error} />;
  const sorted = pos ? [...data].sort((a, b) => dist(pos, a) - dist(pos, b)) : data;
  return (
    <>
      <PageTitle
        title="Nearby Issues"
        sub={pos ? "Sorted by distance from you" : locErr || "Detecting your location..."}
        right={<button className="btn btn-ghost" onClick={locate}>Use my current location</button>}
      />
      <div className="card mb-5"><MapView incidents={data} height={420} linkPrefix="/incident" userPos={pos} zoom={pos ? 14 : 12} /></div>
      <div className="grid gap-3 md:grid-cols-2">
        {sorted.slice(0, 12).map((i) => (
          <div key={i.id}>
            <IncidentCard incident={i} to={`/incident/${i.id}`} />
            {pos && <div className="mt-1 text-xs text-slate-500">{dist(pos, i).toFixed(1)} km away</div>}
          </div>
        ))}
      </div>
    </>
  );
}
