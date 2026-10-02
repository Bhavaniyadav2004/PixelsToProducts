import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Incident } from "../types";
import { fmtDate, pretty } from "../utils/format";
import { PriorityBadge, SeverityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

export default function IncidentCard({ incident: i, to, footer }: { incident: Incident; to?: string; footer?: ReactNode }) {
  const body = (
    <div className="flex gap-3">
      {i.thumbnail_url ? (
        <img src={i.thumbnail_url} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" loading="lazy" />
      ) : (
        <div className="h-20 w-24 shrink-0 rounded-lg bg-slate-200" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-900">{i.incident_code}</span>
          <StatusBadge status={i.status} />
          {i.recurring && <span className="text-xs font-semibold text-orange-600">RECURRING</span>}
        </div>
        <div className="truncate text-sm text-slate-700">
          {pretty(i.issue_type)} - {i.street_name}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <SeverityBadge severity={i.severity} />
          <PriorityBadge level={i.priority_level} score={i.priority_score} />
          <span>{i.report_count} report{i.report_count !== 1 && "s"}</span>
          <span>{fmtDate(i.first_reported_at)}</span>
        </div>
      </div>
    </div>
  );
  return (
    <div className="card transition hover:shadow-md">
      {to ? <Link to={to}>{body}</Link> : body}
      {footer && <div className="mt-3 border-t pt-3">{footer}</div>}
    </div>
  );
}
