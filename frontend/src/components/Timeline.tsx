import { TimelineEvent } from "../types";
import { fmtDate } from "../utils/format";

const ICON: Record<string, [string, string]> = {
  REPORT: ["📸", "bg-sky-500"],
  PROGRESSION: ["📈", "bg-orange-500"],
  VERIFIED: ["👁", "bg-sky-500"],
  ASSIGNED: ["📋", "bg-indigo-500"],
  ACCEPTED: ["🤝", "bg-indigo-500"],
  REPAIR_STARTED: ["🚧", "bg-amber-500"],
  REPAIR_BEFORE: ["📷", "bg-amber-500"],
  REPAIR_DURING: ["📷", "bg-amber-500"],
  REPAIR_AFTER: ["📷", "bg-teal-500"],
  REPAIR_COMPLETED: ["🛠", "bg-teal-500"],
  AI_VERIFICATION: ["🔍", "bg-purple-500"],
  CITIZEN_CONFIRMATION: ["👤", "bg-purple-500"],
  RESOLVED: ["✅", "bg-emerald-600"],
  REOPENED: ["⚠", "bg-rose-500"],
  REVIEW: ["⚖", "bg-rose-500"],
  NOTE: ["📝", "bg-slate-500"],
  PRIORITY: ["⭐", "bg-slate-500"],
  ADMIN: ["🏛", "bg-slate-500"],
};

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  if (!events.length) return <p className="text-sm text-slate-500">No activity yet.</p>;
  return (
    <ol className="relative ml-5 border-l-2 border-slate-200">
      {events.map((e) => {
        const [icon, color] = ICON[e.event_type] ?? ["•", "bg-slate-400"];
        return (
          <li key={e.id} className="mb-8 ml-7">
            <span className={`absolute -left-[17px] flex h-8 w-8 items-center justify-center rounded-full text-base ring-4 ring-white ${color}`}>{icon}</span>
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
