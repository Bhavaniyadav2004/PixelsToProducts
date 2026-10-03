import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Incident } from "../types";
import { fmtDate, pretty } from "../utils/format";
import BeforeAfter from "./BeforeAfter";
import MapView from "./MapView";
import { PriorityBadge, SeverityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import Timeline from "./Timeline";

const RESULT_TONE: Record<string, string> = {
  VERIFIED: "text-emerald-700", REQUIRES_REVIEW: "text-amber-700", FAILED: "text-rose-700",
};

export default function IncidentView({ incident: i, children, showPriority = true }: { incident: Incident; children?: ReactNode; showPriority?: boolean }) {
  const v = i.verification;
  const citizenMedia = (i.media ?? []).filter((m) => m.media_role === "CITIZEN_REPORT");
  return (
    <div>
      <div className="card mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{i.incident_code}</h1>
          <StatusBadge status={i.status} />
          <SeverityBadge severity={i.severity} />
          {showPriority && <PriorityBadge level={i.priority_level} score={i.priority_score} />}
          {i.recurring && <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">RECURRING ISSUE</span>}
        </div>
        <div className="mt-1 text-slate-700">
          {pretty(i.issue_type)} on{" "}
          <Link to={`/street/${i.street_slug}`} className="font-medium text-indigo-600 hover:underline">{i.street_name}</Link>
        </div>
        <div className="mt-1 text-sm text-slate-500">
          First reported {fmtDate(i.first_reported_at)} - {i.report_count} citizen report{i.report_count !== 1 && "s"}
          {i.department && ` - ${i.department.name}`}
          {i.assigned_user && ` - ${i.assigned_user.name}`}
          {i.due_date && ` - due ${fmtDate(i.due_date)}`}
        </div>
        {i.recurring && (
          <p className="mt-2 rounded-lg bg-orange-50 p-2 text-sm text-orange-800">
            Possible recurring infrastructure problem: {i.recurrence_count} incidents of this type at approximately this location.
          </p>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold">Visual Timeline</h2>
          <Timeline events={i.timeline ?? []} />
        </section>

        <aside className="space-y-5">
          {children}
          {i.before && i.after && (
            <section className="card">
              <h2 className="mb-3 font-bold">Before / After</h2>
              <BeforeAfter before={i.before} after={i.after} />
            </section>
          )}
          {v && (
            <section className="card text-sm">
              <h2 className="mb-2 font-bold">Verification</h2>
              <div>AI: <b className={RESULT_TONE[v.ai_result]}>{pretty(v.ai_result)}</b> ({Math.round(v.ai_confidence * 100)}% confidence)</div>
              {v.ai_summary && <p className="mt-1 text-slate-600">{v.ai_summary}</p>}
              <div className="mt-1">Citizen: <b>{v.citizen_result ?? "Pending"}</b></div>
              <p className="mt-2 text-xs text-slate-400">AI is decision support, not proof.</p>
            </section>
          )}
          {showPriority && i.priority_reasons && (
            <section className="card text-sm">
              <h2 className="mb-2 font-bold">Why this priority?</h2>
              <ul className="space-y-1">{i.priority_reasons.map((r) => <li key={r} className="list-inside list-disc">{r}</li>)}</ul>
              {i.priority_locked && <p className="mt-2 text-xs text-slate-500">Priority level manually set by an admin.</p>}
            </section>
          )}
          <section className="card">
            <h2 className="mb-3 font-bold">Location</h2>
            <MapView incidents={[i]} height={220} zoom={16} />
          </section>
          {citizenMedia.length > 0 && (
            <section className="card">
              <h2 className="mb-3 font-bold">Citizen evidence &amp; AI analysis</h2>
              <div className="grid grid-cols-2 gap-2">
                {citizenMedia.map((m) => (
                  <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="block text-xs">
                    <img src={m.thumbnail_url ?? m.url} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-lg object-cover" />
                    {m.analysis && <div className="mt-1 text-slate-500">{pretty(m.analysis.issue_type)} - {m.analysis.severity} ({Math.round(m.analysis.confidence * 100)}%)</div>}
                  </a>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
