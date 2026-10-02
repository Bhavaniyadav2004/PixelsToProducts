export const fmtDate = (s?: string | null) =>
  s ? new Date(s + (s.endsWith("Z") ? "" : "Z")).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "-";

export const pretty = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w+/g, (w) => w.toLowerCase());

export const homeFor = (role: string) =>
  role === "ADMIN" ? "/admin" : role === "MUNICIPAL_MEMBER" ? "/municipal" : "/citizen";

export const sevColor: Record<string, string> = {
  CRITICAL: "#dc2626",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
};
