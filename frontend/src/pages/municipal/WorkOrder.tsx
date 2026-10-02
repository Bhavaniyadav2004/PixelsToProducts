import { useState } from "react";
import { useParams } from "react-router-dom";
import IncidentView from "../../components/IncidentView";
import { PageTitle } from "../../components/Layout";
import MediaUploader from "../../components/MediaUploader";
import { Loading } from "../../components/StatCard";
import { useFetch } from "../../hooks/useFetch";
import { api, errMsg } from "../../services/api";
import { Incident } from "../../types";

export default function WorkOrder() {
  const { id } = useParams();
  const { data, error, reload, setData } = useFetch<Incident>(`/municipal/work-orders/${id}`);
  const [note, setNote] = useState("");
  const [stage, setStage] = useState("BEFORE");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (!data) return <Loading error={error} />;
  const i = data;
  const open = i.status === "ASSIGNED" || i.status === "IN_PROGRESS";

  const act = async (action: string, notes?: string) => {
    setBusy(true);
    setMsg("");
    try {
      const { data } = await api.patch(`/municipal/work-orders/${id}/status`, { action, notes: notes || null });
      setData(data);
      if (action === "note") setNote("");
    } catch (e) {
      setMsg(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageTitle title="Work Order" />
      <IncidentView incident={i}>
        <section className="card space-y-3">
          <h2 className="font-bold">Actions</h2>
          {!open && <p className="text-sm text-slate-500">No actions available in status {i.status.replace(/_/g, " ").toLowerCase()}.</p>}
          {i.status === "ASSIGNED" && (
            <div className="flex gap-2">
              <button className="btn btn-ghost" disabled={busy} onClick={() => act("accept", note)}>Accept</button>
              <button className="btn btn-primary" disabled={busy} onClick={() => act("start", note)}>Start Work</button>
            </div>
          )}
          {open && (
            <>
              <textarea className="input" rows={2} placeholder="Work note, e.g. Inspection completed. Road damage confirmed." value={note} onChange={(e) => setNote(e.target.value)} />
              <button className="btn btn-ghost" disabled={busy || !note.trim()} onClick={() => act("note", note)}>Add Note</button>
              <div className="border-t pt-3">
                <label className="label">Upload repair evidence</label>
                <select className="input mb-2" value={stage} onChange={(e) => setStage(e.target.value)}>
                  <option value="BEFORE">Before</option><option value="DURING">During</option><option value="AFTER">After</option>
                </select>
                <MediaUploader endpoint={`/municipal/work-orders/${id}/media`} extra={{ stage }} onUploaded={reload} label="Upload Evidence" />
              </div>
            </>
          )}
          {i.status === "IN_PROGRESS" && (
            <button className="btn btn-green w-full" disabled={busy} onClick={() => act("complete", note)}>Mark Completed</button>
          )}
          {msg && <p className="text-sm text-rose-600">{msg}</p>}
        </section>
      </IncidentView>
    </>
  );
}
