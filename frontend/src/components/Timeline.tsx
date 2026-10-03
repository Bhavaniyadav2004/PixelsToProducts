import { TimelineEvent } from "../types";
import { fmtDate } from "../utils/format";

const COLOR: Record<string, string> = {
  REPORT: "bg-slate-600",
  PROGRESSION: "bg-orange-600",
  VERIFIED: "bg-slate-600",
  ASSIGNED: "bg-brand-600",
  ACCEPTED: "bg-brand-600",
  REPAIR_STARTED: "bg-amber-600",
  REPAIR_BEFORE: "bg-amber-600",
  REPAIR_DURING: "bg-amber-600",
  REPAIR_AFTER: "bg-teal-600",
  REPAIR_COMPLETED: "bg-teal-600",
  AI_VERIFICATION: "bg-violet-600",
  CITIZEN_CONFIRMATION: "bg-violet-600",
  RESOLVED: "bg-emerald-700",
  REOPENED: "bg-red-600",
  REVIEW: "bg-red-600",
};

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  if (!events.length) return <p className="text-sm text-gray-500">No activity yet.</p>;
  return (
    <ol className="relative ml-2 border-l border-gray-300">
      {events.map((e) => (
        <li key={e.id} className="relative mb-6 pl-6">
          <span className={`absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white ${COLOR[e.event_type] ?? "bg-gray-500"}`} />
          <div className="text-xs text-gray-500">{fmtDate(e.created_at)}{e.actor_name && <> &middot; {e.actor_name}</>}</div>
          <div className="font-semibold text-gray-900">{e.title}</div>
          {e.detail && <p className="text-sm text-gray-600">{e.detail}</p>}
          {e.media_url && (
            <a href={e.media_url} target="_blank" rel="noreferrer" className="mt-2 block w-full max-w-md">
              {e.media_type === "video" ? (
                <video src={e.media_url} controls className="w-full rounded-sm border border-gray-300" />
              ) : (
                <img src={e.thumbnail_url ?? e.media_url} alt={e.title} loading="lazy" className="w-full rounded-sm border border-gray-300 object-cover" />
              )}
            </a>
          )}
        </li>
      ))}
    </ol>
  );
}
