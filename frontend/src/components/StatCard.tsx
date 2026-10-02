import { ReactNode } from "react";

export function StatCard({ label, value, tone = "slate" }: { label: string; value: ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    slate: "text-slate-900", red: "text-red-600", orange: "text-orange-600", amber: "text-amber-600",
    green: "text-emerald-600", purple: "text-purple-600", indigo: "text-indigo-600",
  };
  return (
    <div className="card">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${tones[tone]}`}>{value}</div>
    </div>
  );
}

export function Loading({ error }: { error?: string }) {
  return error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : <p className="p-6 text-sm text-slate-500">Loading...</p>;
}
