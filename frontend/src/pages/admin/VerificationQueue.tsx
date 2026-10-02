import { useState } from "react";
import { Link } from "react-router-dom";
import BeforeAfter from "../../components/BeforeAfter";
import { PageTitle } from "../../components/Layout";
import { StatusBadge } from "../../components/StatusBadge";
import { Loading } from "../../components/StatCard";
import { useFetch } from "../../hooks/useFetch";
import { api, errMsg } from "../../services/api";
import { Incident } from "../../types";
import { pretty } from "../../utils/format";

interface Row { kind: "FAILED" | "DISPUTED" | "REVIEW" | "AWAITING"; incident: Incident }

const KIND: Record<string, [string, string]> = {
  FAILED: ["Failed AI verification", "bg-rose-100 text-rose-700"],
  DISPUTED: ["Citizen dispute", "bg-orange-100 text-orange-700"],
  REVIEW: ["Needs review", "bg-amber-100 text-amber-700"],
  AWAITING: ["Awaiting verification", "bg-purple-100 text-purple-700"],
};

export default function VerificationQueue() {
  const { data, error, reload } = useFetch<Row[]>("/admin/verification-queue");
  const [msg, setMsg] = useState("");
  if (!data) return <Loading error={error} />;

  const act = async (id: number, status: string, note: string) => {
    try {
      await api.patch(`/incidents/${id}`, { status, note });
      reload();
    } catch (e) {
      setMsg(errMsg(e));
    }
  };

  return (
    <>
      <PageTitle title="Verification Queue" sub="Awaiting verification, failed verification and citizen disputes" />
      {msg && <p className="mb-3 text-sm text-rose-600">{msg}</p>}
      <div className="space-y-5">
        {data.map(({ kind, incident: i }) => (
          <section key={i.id} className="card">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <Link to={`/admin/incidents/${i.id}`} className="text-lg font-bold text-indigo-600">{i.incident_code}</Link>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${KIND[kind][1]}`}>{KIND[kind][0]}</span>
              <StatusBadge status={i.status} />
              <span className="text-sm text-slate-500">{pretty(i.issue_type)} - {i.street_name}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="max-w-xl"><BeforeAfter before={i.before} after={i.after} /></div>
              <div className="text-sm">
                <div>AI: <b>{pretty(i.verification?.ai_result ?? "-")}</b> ({Math.round((i.verification?.ai_confidence ?? 0) * 100)}%)</div>
                <p className="text-slate-600">{i.verification?.ai_summary}</p>
                <div className="mt-1">Citizen: <b>{i.verification?.citizen_result ?? "Pending"}</b></div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn btn-green" onClick={() => act(i.id, "RESOLVED", "Approved by admin review")}>Approve &amp; Resolve</button>
                  <button className="btn btn-red" onClick={() => act(i.id, "IN_PROGRESS", "Repair reopened by admin review")}>Reopen repair</button>
                </div>
              </div>
            </div>
          </section>
        ))}
        {!data.length && <p className="text-slate-500">Nothing needs review.</p>}
      </div>
    </>
  );
}
