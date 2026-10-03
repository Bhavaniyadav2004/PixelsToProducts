import { pretty } from "../utils/format";

const STATUS: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-700 border-gray-300",
  VERIFIED: "bg-gray-100 text-gray-800 border-gray-400",
  ASSIGNED: "bg-slate-100 text-slate-800 border-slate-400",
  IN_PROGRESS: "bg-amber-50 text-amber-800 border-amber-300",
  COMPLETED: "bg-teal-50 text-teal-800 border-teal-300",
  AWAITING_VERIFICATION: "bg-violet-50 text-violet-800 border-violet-300",
  REQUIRES_REVIEW: "bg-red-50 text-red-800 border-red-300",
  RESOLVED: "bg-emerald-50 text-emerald-800 border-emerald-300",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded border px-2 py-0.5 text-xs font-medium ${STATUS[status] ?? STATUS.NEW}`}>
      {pretty(status)}
    </span>
  );
}
