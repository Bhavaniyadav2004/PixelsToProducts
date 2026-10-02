import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MediaUploader from "../../components/MediaUploader";
import { PageTitle } from "../../components/Layout";
import { SeverityBadge } from "../../components/PriorityBadge";
import { api, errMsg } from "../../services/api";
import { Analysis, Incident, MediaItem } from "../../types";
import { pretty } from "../../utils/format";

const TYPES = ["POTHOLE", "ROAD_CRACK", "WATERLOGGING", "BROKEN_FOOTPATH", "DAMAGED_MANHOLE", "DAMAGED_SIGN", "BROKEN_STREETLIGHT", "OTHER"];
const SEVS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function ReportIssue() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [severity, setSeverity] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [coords, setCoords] = useState<{ lat: string; lon: string }>({ lat: "", lon: "" });
  const [locMsg, setLocMsg] = useState("");
  const [street, setStreet] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ incident: Incident; created_new_incident: boolean; report_id: number } | null>(null);

  const locate = () => {
    setLocMsg("Locating...");
    navigator.geolocation?.getCurrentPosition(
      (p) => { setCoords({ lat: p.coords.latitude.toFixed(6), lon: p.coords.longitude.toFixed(6) }); setLocMsg("Location captured"); },
      () => setLocMsg("Could not get location - enter it manually"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
    if (!navigator.geolocation) setLocMsg("Geolocation unsupported - enter it manually");
  };
  useEffect(locate, []);

  const onUploaded = async (m: MediaItem) => {
    setMedia((prev) => [...prev, m]);
    if (analysis) return;
    setAnalyzing(true);
    try {
      const { data } = await api.post(`/ai/analyze/${m.id}`);
      setAnalysis(data);
      setIssueType(data.issue_type);
      setSeverity(data.severity);
    } catch (e) {
      setError(errMsg(e));
      setCorrecting(true);
      setIssueType("POTHOLE");
      setSeverity("MEDIUM");
    } finally {
      setAnalyzing(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/reports", {
        description: desc || null, latitude: parseFloat(coords.lat), longitude: parseFloat(coords.lon),
        street_name: street || null, issue_type: issueType, severity, media_ids: media.map((m) => m.id),
      });
      setDone(data);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="card mx-auto max-w-lg text-center">
        <div className="text-4xl">✅</div>
        <h1 className="mt-2 text-xl font-bold">Report submitted successfully.</h1>
        <p className="mt-2">Incident: <b>{done.incident.incident_code}</b> - Status: <b>{pretty(done.incident.status)}</b></p>
        <p className="text-sm text-slate-500">
          {done.created_new_incident ? "A new incident was created." : `Your report was added to an existing incident (${done.incident.report_count} reports).`}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link className="btn btn-primary" to={`/citizen/reports/${done.report_id}`}>View Timeline</Link>
          <Link className="btn btn-ghost" to="/citizen">Home</Link>
        </div>
      </div>
    );

  const ready = media.length > 0 && confirmed && coords.lat && coords.lon && !isNaN(parseFloat(coords.lat)) && !isNaN(parseFloat(coords.lon));

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageTitle title="Report an Issue" />
      <section className="card">
        <h2 className="mb-3 font-bold">1. Photo or video</h2>
        <MediaUploader onUploaded={onUploaded} label="Upload Photo / Video" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {media.map((m) => (
            m.media_type === "video"
              ? <video key={m.id} src={m.url} className="aspect-square rounded-lg object-cover" controls />
              : <img key={m.id} src={m.thumbnail_url ?? m.url} className="aspect-square rounded-lg object-cover" alt="" />
          ))}
        </div>
      </section>

      {(analyzing || analysis || correcting) && (
        <section className="card">
          <h2 className="mb-3 font-bold">2. What we detected</h2>
          {analyzing ? <p className="text-sm text-slate-500">Analyzing...</p> : (
            <>
              {!correcting ? (
                <div>
                  <div className="text-lg font-semibold">{pretty(issueType)} <SeverityBadge severity={severity} /></div>
                  {analysis && <p className="text-sm text-slate-500">{analysis.description} ({Math.round(analysis.confidence * 100)}% confidence)</p>}
                  {analysis?.source === "demo" && <p className="mt-1 text-xs text-amber-600">AI is running in demo mode - please check this carefully.</p>}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Issue type</label><select className="input" value={issueType} onChange={(e) => setIssueType(e.target.value)}>{TYPES.map((t) => <option key={t} value={t}>{pretty(t)}</option>)}</select></div>
                  <div><label className="label">Severity</label><select className="input" value={severity} onChange={(e) => setSeverity(e.target.value)}>{SEVS.map((t) => <option key={t}>{t}</option>)}</select></div>
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button className={`btn ${confirmed ? "btn-green" : "btn-primary"}`} onClick={() => { setConfirmed(true); setCorrecting(false); }}>{confirmed ? "Confirmed ✓" : "Confirm"}</button>
                {!correcting && <button className="btn btn-ghost" onClick={() => { setCorrecting(true); setConfirmed(false); }}>Correct</button>}
              </div>
            </>
          )}
        </section>
      )}

      <section className="card space-y-3">
        <h2 className="font-bold">3. Location &amp; details</h2>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Latitude</label><input className="input" value={coords.lat} onChange={(e) => setCoords({ ...coords, lat: e.target.value })} /></div>
          <div><label className="label">Longitude</label><input className="input" value={coords.lon} onChange={(e) => setCoords({ ...coords, lon: e.target.value })} /></div>
        </div>
        <div className="flex items-center gap-3"><button className="btn btn-ghost" onClick={locate}>📍 Use my location</button><span className="text-xs text-slate-500">{locMsg}</span></div>
        <div><label className="label">Street / landmark (optional)</label><input className="input" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="e.g. MG Road" /></div>
        <div><label className="label">Description (optional)</label><textarea className="input" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Large pothole near the junction" /></div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="btn btn-primary w-full" disabled={!ready || busy} onClick={submit}>{busy ? "Submitting..." : "Submit"}</button>
        {!ready && <p className="text-xs text-slate-500">Add media, confirm the detected issue and provide a location to submit.</p>}
      </section>
    </div>
  );
}
