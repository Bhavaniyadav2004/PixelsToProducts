const COLORS: Record<string, string> = {
  CRITICAL: "bg-red-600 text-white",
  HIGH: "bg-orange-500 text-white",
  MEDIUM: "bg-yellow-400 text-yellow-900",
  LOW: "bg-green-500 text-white",
};

const pill = "inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold";

export function PriorityBadge({ level, score }: { level: string; score?: number }) {
  return (
    <span className={`${pill} ${COLORS[level] ?? COLORS.LOW}`}>
      {level}
      {score !== undefined && ` ${Math.round(score)}`}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  return <span className={`${pill} ${COLORS[severity] ?? COLORS.LOW}`}>{severity}</span>;
}
