import { useState } from "react";
import { useParams } from "react-router-dom";
import BeforeAfter from "../../components/BeforeAfter";
import IncidentView from "../../components/IncidentView";
import { PageTitle } from "../../components/Layout";
import { Loading } from "../../components/StatCard";
import { useFetch } from "../../hooks/useFetch";
import { api, errMsg } from "../../services/api";
import { Incident } from "../../types";

export default function ReportDetails() {
  const { id } = useParams();
  const { data, error, reload } = useFetch<{ id: number; incident: Incident }>(`/reports/${id}`);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (!data) return <Loading error={error} />;
  const i = data.incident;
  const canConfirm = i.status === "AWAITING_VERIFICATION" && i.verification && !i.verification.citizen_result;

  const answer = async (confirmed: boolean) => {
    setBusy(true);
    setMsg("");
    try {
      await api.post(`/reports/${id}/citizen-verification`, { confirmed });
      reload();
    } catch (e) {
      setMsg(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageTitle title="Report details" />
      {canConfirm && (
        <div className="card mb-5 border-purple-300 bg-purple-50">
          <h2 className="text-lg font-bold">This issue was marked as repaired.</h2>
          <div className="my-3 max-w-2xl"><BeforeAfter before={i.before} after={i.after} /></div>
          <p className="mb-3 font-medium">Does the road look repaired?</p>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-green" disabled={busy} onClick={() => answer(true)}>YES - Looks Fixed</button>
            <button className="btn btn-red" disabled={busy} onClick={() => answer(false)}>NO - Still Damaged</button>
          </div>
          {msg && <p className="mt-2 text-sm text-rose-600">{msg}</p>}
        </div>
      )}
      <IncidentView incident={i} showPriority={false} />
    </>
  );
}
