import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import IncidentCard from "../../components/IncidentCard";
import MapView from "../../components/MapView";
import { Loading, StatCard } from "../../components/StatCard";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { Incident } from "../../types";

export interface MyReport { id: number; description: string | null; created_at: string; incident: Incident }

export default function CitizenDashboard() {
  const { user } = useAuth();
  const mine = useFetch<MyReport[]>("/reports/my");
  const all = useFetch<Incident[]>("/incidents");
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [locMsg, setLocMsg] = useState("Detecting your location...");
  const locate = () => {
    if (!navigator.geolocation) return setLocMsg("This browser does not support location.");
    setLocMsg("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos([p.coords.latitude, p.coords.longitude]); setLocMsg(""); },
      (e) => setLocMsg(e.code === 1 ? "Location permission is blocked. Allow it in the browser's site settings, then retry." : "Could not determine your location."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  useEffect(locate, []);
  if (!mine.data || !all.data) return <Loading error={mine.error || all.error} />;

  const uniqueReports = [...new Map(mine.data.map((r) => [r.incident.id, r])).values()];
  const incidents = uniqueReports.map((r) => r.incident);
  const open = incidents.filter((i) => i.status !== "RESOLVED").length;
  const needsConfirm = uniqueReports.filter((r) => r.incident.status === "AWAITING_VERIFICATION");

  return (
    <>
      <section className="hero mb-5 flex flex-wrap items-center justify-between gap-4 px-6 py-8 sm:px-8">
        <div>
          <p className="text-sm text-white/70">Citizen portal</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Hello, {user?.name}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/80">Report road and street issues, follow each repair through its timeline, and confirm when the work is done.</p>
        </div>
        <Link to="/citizen/report" className="btn bg-white px-5 py-2.5 text-slate-900 hover:bg-slate-200">Report an issue</Link>
      </section>
      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatCard label="My reports" value={mine.data.length} />
        <StatCard label="Open issues" value={open} tone="orange" />
        <StatCard label="Resolved" value={incidents.length - open} tone="green" />
      </div>
      {needsConfirm.length > 0 && (
        <div className="mb-5 rounded-xl border border-purple-200 bg-purple-50 p-4">
          <b className="text-purple-800">Repair ready for your confirmation</b>
          <div className="mt-2 flex flex-wrap gap-2">
            {needsConfirm.map((r) => <Link key={r.id} className="btn btn-primary" to={`/citizen/reports/${r.id}`}>{r.incident.incident_code}: review before/after</Link>)}
          </div>
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-bold">Nearby issues</h2>
            <button className="btn btn-ghost px-3 py-1 text-xs" onClick={locate}>Use my location</button>
          </div>
          {locMsg && <p className="mb-2 text-xs text-slate-500">{locMsg}</p>}
          <MapView incidents={all.data} linkPrefix="/incident" userPos={pos} zoom={pos ? 14 : 12} />
        </section>
        <section>
          <h2 className="mb-3 font-bold">Recent reports</h2>
          <div className="space-y-3">
            {uniqueReports.slice(0, 4).map((r) => <IncidentCard key={r.id} incident={r.incident} to={`/citizen/reports/${r.id}`} />)}
            {!mine.data.length && <p className="text-sm text-slate-500">You haven't reported anything yet.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
