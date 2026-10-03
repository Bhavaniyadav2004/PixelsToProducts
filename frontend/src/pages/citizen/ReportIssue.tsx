import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MediaUploader from "../../components/MediaUploader";
import LocationPicker from "../../components/LocationPicker";
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
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [street, setStreet] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ incident: Incident; created_new_incident: boolean; report_id: number } | null>(null);

  const locate = () => {
    if (!navigator.geolocation) {
      setLocMsg("Geolocation is not supported. Select the location on the map.");
      return;
    }
    setLocMsg("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude.toFixed(6), lon: p.coords.longitude.toFixed(6) });
        setAccuracy(p.coords.accuracy);
        setLocMsg(`Location detected (accuracy about ${Math.round(p.coords.accuracy)} m). Click the map to adjust.`);
      },
      () => setLocMsg("Location access was denied or unavailable. Click the map to select the location."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  useEffect(locate, []);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ place_id: number; display_name: string; lat: string; lon: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState("");

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchMsg("");
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data);
      if (data.length) pick(data[0], true);
      else setSearchMsg("No places found. Try a nearby landmark or area name.");
    } catch {
      setSearchMsg("Search is unavailable right now. Click the map to select the location.");
    } finally {
      setSearching(false);
    }
  };

  const pick = (r: { display_name: string; lat: string; lon: string }, keepList = false) => {
    setCoords({ lat: parseFloat(r.lat).toFixed(6), lon: parseFloat(r.lon).toFixed(6) });
    setAccuracy(null);
    setStreet(r.display_name.split(",").slice(0, 2).join(",").trim());
    setLocMsg("Location set from search. Click the map to fine-tune.");
    if (!keepList) setResults([]);
    setTimeout(() => document.getElementById("location-map")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const latNum = parseFloat(coords.lat);
  const lonNum = parseFloat(coords.lon);
  const hasCoords = !isNaN(latNum) && !isNaN(lonNum);

  const onUploaded = async (m: MediaItem) => {
    setMedia((prev) => [...prev, m]);
    if (analysis || confirmed || correcting || analyzing) return;
    setConfirmed(false);
    setError("");
    setAnalyzing(true);
    try {
      const { data } = await api.post(`/ai/analyze/${m.id}`);
      setAnalysis(data);
      setIssueType(data.issue_type);
      setSeverity(data.severity);
    } catch (e) {
      setError(errMsg(e));
      setCorrecting(true);
      setIssueType("");
      setSeverity("");
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
        <h1 className="text-xl font-semibold">Report submitted</h1>
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

  const ready = media.length > 0 && confirmed && hasCoords && !analyzing && TYPES.includes(issueType) && SEVS.includes(severity);

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
          <h2 className="mb-3 font-bold">2. Issue classification</h2>
          {analyzing ? <p className="text-sm text-slate-500">Analyzing...</p> : (
            <>
              {!correcting ? (
                <div>
                  <div className="text-lg font-semibold">{pretty(issueType)} <SeverityBadge severity={severity} /></div>
                  {analysis && <p className="text-sm text-slate-500">{analysis.description} ({Math.round(analysis.confidence * 100)}% model-reported confidence)</p>}
                  {analysis?.source === "cloudinary_ai_vision" && <p className="mt-1 text-xs text-slate-500">Cloudinary AI Vision suggestion</p>}
                  {analysis?.source === "demo" && <p className="mt-1 text-xs text-amber-600">AI is running in demo mode - please check this carefully.</p>}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label" htmlFor="issue-type">Issue type</label><select id="issue-type" className="input" value={issueType} onChange={(e) => setIssueType(e.target.value)}><option value="" disabled>Select issue type</option>{TYPES.map((t) => <option key={t} value={t}>{pretty(t)}</option>)}</select></div>
                  <div><label className="label" htmlFor="severity">Severity</label><select id="severity" className="input" value={severity} onChange={(e) => setSeverity(e.target.value)}><option value="" disabled>Select severity</option>{SEVS.map((t) => <option key={t}>{t}</option>)}</select></div>
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button className={`btn ${confirmed ? "btn-green" : "btn-primary"}`} disabled={!TYPES.includes(issueType) || !SEVS.includes(severity)} onClick={() => { setConfirmed(true); setCorrecting(false); }}>{confirmed ? "Confirmed" : "Confirm"}</button>
                {!correcting && <button className="btn btn-ghost" onClick={() => { setCorrecting(true); setConfirmed(false); }}>Correct</button>}
              </div>
            </>
          )}
        </section>
      )}

      <section className="card space-y-3">
        <h2 className="font-bold">3. Location &amp; details</h2>
        <div>
          <label className="label" htmlFor="place-search">Search for a place, street or landmark</label>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); search(); }}>
            <input id="place-search" className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Silk Board Junction, Bengaluru" />
            <button className="btn btn-primary" type="submit" disabled={searching || !query.trim()}>{searching ? "Searching..." : "Search"}</button>
          </form>
          {searchMsg && <p className="mt-1 text-xs text-slate-500">{searchMsg}</p>}
          {results.length > 0 && (
            <ul className="mt-2 divide-y divide-gray-200 rounded border border-gray-300 bg-white text-sm">
              {results.map((r) => (
                <li key={r.place_id}>
                  <button type="button" className="w-full px-3 py-2 text-left hover:bg-gray-50" onClick={() => pick(r)}>{r.display_name}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Latitude</label><input className="input" value={coords.lat} onChange={(e) => setCoords({ ...coords, lat: e.target.value })} /></div>
          <div><label className="label">Longitude</label><input className="input" value={coords.lon} onChange={(e) => setCoords({ ...coords, lon: e.target.value })} /></div>
        </div>
        <div className="flex items-center gap-3"><button className="btn btn-ghost" onClick={locate}>Use my current location</button><span className="text-xs text-slate-500">{locMsg}</span></div>
        <LocationPicker
          lat={hasCoords ? latNum : null}
          lon={hasCoords ? lonNum : null}
          accuracy={accuracy}
          onChange={(la, lo) => { setCoords({ lat: la.toFixed(6), lon: lo.toFixed(6) }); setAccuracy(null); setLocMsg("Location set from map."); }}
        />
        <div><label className="label">Street / landmark (optional)</label><input className="input" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="e.g. MG Road" /></div>
        <div><label className="label">Description (optional)</label><textarea className="input" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Large pothole near the junction" /></div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="btn btn-primary w-full" disabled={!ready || busy} onClick={submit}>{busy ? "Submitting..." : "Submit"}</button>
        {!ready && <p className="text-xs text-slate-500">Add media, confirm the detected issue and provide a location to submit.</p>}
      </section>
    </div>
  );
}
