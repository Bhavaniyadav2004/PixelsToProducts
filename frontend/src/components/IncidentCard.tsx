import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Incident } from "../types";
import { fmtDate, pretty } from "../utils/format";
import { PriorityBadge, SeverityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

export default function IncidentCard({ incident: i, to, footer }: { incident: Incident; to?: string; footer?: ReactNode }) {
  const body = (
    <div className="flex flex-col gap-3 sm:flex-row">
      {i.thumbnail_url ? (
        <img src={i.thumbnail_url} alt="" className="h-20 w-28 shrink-0 rounded-sm border border-gray-200 object-cover" loading="lazy" />
      ) : (
        <div className="h-20 w-28 shrink-0 rounded-sm bg-gray-200" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-brand-600">{i.incident_code}</span>
          <StatusBadge status={i.status} />
          {i.recurring && <span className="text-xs font-semibold text-orange-700">Recurring</span>}
        </div>
        <div className="truncate text-sm text-gray-800">{pretty(i.issue_type)}, {i.street_name}</div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <SeverityBadge severity={i.severity} />
          <PriorityBadge level={i.priority_level} score={i.priority_score} />
          <span>{i.report_count} report{i.report_count !== 1 && "s"}</span>
          <span>Reported {fmtDate(i.first_reported_at)}</span>
        </div>
      </div>
    </div>
  );
  return (
    <div className="card hover:border-gray-400">
      {to ? <Link to={to} className="block">{body}</Link> : body}
      {footer && <div className="mt-3 border-t border-gray-200 pt-3">{footer}</div>}
    </div>
  );
}
