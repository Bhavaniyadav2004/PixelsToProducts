import { pretty } from "../utils/format";

const STATUS: Record<string, string> = {
  NEW: "bg-slate-100 text-slate-700",
  VERIFIED: "bg-sky-100 text-sky-700",
  ASSIGNED: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-teal-100 text-teal-700",
  AWAITING_VERIFICATION: "bg-purple-100 text-purple-700",
  REQUIRES_REVIEW: "bg-rose-100 text-rose-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

const pill = "inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold";

export function StatusBadge({ status }: { status: string }) {
  return <span className={`${pill} ${STATUS[status] ?? STATUS.NEW}`}>{pretty(status)}</span>;
}
