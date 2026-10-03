import { pretty } from "../utils/format";

const COLORS: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-900 border-red-400",
  HIGH: "bg-orange-100 text-orange-900 border-orange-400",
  MEDIUM: "bg-yellow-100 text-yellow-900 border-yellow-400",
  LOW: "bg-green-100 text-green-900 border-green-400",
};

const base = "inline-block whitespace-nowrap rounded border px-2 py-0.5 text-xs font-medium";

export function PriorityBadge({ level, score }: { level: string; score?: number }) {
  return (
    <span className={`${base} ${COLORS[level] ?? COLORS.LOW}`} title="Priority">
      Priority: {pretty(level)}
      {score !== undefined && ` (${Math.round(score)})`}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  return <span className={`${base} ${COLORS[severity] ?? COLORS.LOW}`} title="Severity">{pretty(severity)}</span>;
}
