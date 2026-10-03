import { ReactNode } from "react";

export function StatCard({ label, value }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="card">
      <div className="text-xs font-medium text-gray-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">{value}</div>
    </div>
  );
}

export function Loading({ error }: { error?: string }) {
  if (error) return <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>;
  return <p className="p-6 text-sm text-gray-500">Loading...</p>;
}
