import { TimelineEvent } from "../types";
import { fmtDate } from "../utils/format";

const COLOR: Record<string, string> = {
  REPORT: "bg-sky-600",
  PROGRESSION: "bg-orange-600",
  VERIFIED: "bg-sky-600",
  ASSIGNED: "bg-slate-700",
  ACCEPTED: "bg-slate-700",
  REPAIR_STARTED: "bg-amber-600",
  REPAIR_BEFORE: "bg-amber-600",
  REPAIR_DURING: "bg-amber-600",
  REPAIR_AFTER: "bg-teal-600",
  REPAIR_COMPLETED: "bg-teal-600",
  AI_VERIFICATION: "bg-violet-600",
  CITIZEN_CONFIRMATION: "bg-violet-600",
  RESOLVED: "bg-emerald-600",
  REOPENED: "bg-rose-600",
  REVIEW: "bg-rose-600",
};

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  if (!events.length) return <p className="text-sm text-slate-500">No activity yet.</p>;
  return (
    <ol className="relative ml-3 border-l border-slate-300">
      {events.map((e) => {
        const color = COLOR[e.event_type] ?? "bg-slate-500";
        return (
          <li key={e.id} className="mb-7 ml-6">
            <span className={`absolute -left-[7px] mt-1 h-3 w-3 rounded-full ring-4 ring-white ${color}`} />
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{fmtDate(e.created_at)}</div>
            <div className="text-base font-semibold text-slate-900">{e.title}</div>
            {e.detail && <p className="text-sm text-slate-600">{e.detail}</p>}
            {e.media_url && (
              <a href={e.media_url} target="_blank" rel="noreferrer" className="mt-2 block w-full max-w-md">
                {e.media_type === "video" ? (
                  <video src={e.media_url} controls className="w-full rounded-xl border" />
                ) : (
                  <img src={e.thumbnail_url ?? e.media_url} alt={e.title} loading="lazy" className="w-full rounded-xl border object-cover shadow" />
                )}
              </a>
            )}
            {e.actor_name && <div className="mt-1 text-xs text-slate-400">by {e.actor_name}</div>}
          </li>
        );
      })}
    </ol>
  );
}
