import { useState } from "react";
import { useParams } from "react-router-dom";
import IncidentView from "../../components/IncidentView";
import { PageTitle } from "../../components/Layout";
import { Loading } from "../../components/StatCard";
import { useFetch } from "../../hooks/useFetch";
import { api, errMsg } from "../../services/api";
import { Incident } from "../../types";

interface Dept { id: number; name: string }
interface U { id: number; name: string; role: string; department_id: number | null }

export default function IncidentDetails() {
  const { id } = useParams();
  const { data, error, setData } = useFetch<Incident>(`/incidents/${id}`);
  const depts = useFetch<Dept[]>("/departments");
  const users = useFetch<U[]>("/admin/users");
  const [dept, setDept] = useState("");
  const [member, setMember] = useState("");
  const [due, setDue] = useState("");
  const [msg, setMsg] = useState("");

  if (!data) return <Loading error={error} />;
  const i = data;
  const members = (users.data ?? []).filter((u) => u.role === "MUNICIPAL_MEMBER" && (!dept || u.department_id === Number(dept)));

  const run = async (fn: () => Promise<any>) => {
    setMsg("");
    try {
      setData((await fn()).data);
    } catch (e) {
      setMsg(errMsg(e));
    }
  };
  const patch = (body: object) => run(() => api.patch(`/incidents/${id}`, body));

  return (
    <>
      <PageTitle title="Incident review" />
      <IncidentView incident={i}>
        <section className="card space-y-3">
          <h2 className="font-bold">{i.assigned_user ? "Reassign" : "Assign"}</h2>
          <div>
            <label className="label">Department</label>
            <select className="input" value={dept} onChange={(e) => { setDept(e.target.value); setMember(""); }}>
              <option value="">Any</option>
              {depts.data?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Municipal member</label>
            <select className="input" value={member} onChange={(e) => setMember(e.target.value)}>
              <option value="">Select...</option>
              {members.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div><label className="label">Due date</label><input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
          <button className="btn btn-primary w-full" disabled={!member || i.status === "RESOLVED"}
            onClick={() => run(() => api.post(`/admin/incidents/${id}/assign`, {
              user_id: Number(member), department_id: dept ? Number(dept) : null, due_date: due ? new Date(due).toISOString() : null,
            }))}>Assign</button>
        </section>

        <section className="card space-y-3">
          <h2 className="font-bold">Admin controls</h2>
          <div>
            <label className="label">Priority level</label>
            <select className="input" value={i.priority_level} onChange={(e) => patch({ priority_level: e.target.value })}>
              {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => <option key={p}>{p}</option>)}
            </select>
            {i.priority_locked && <button className="mt-1 text-xs text-indigo-600" onClick={() => patch({ unlock_priority: true })}>Restore calculated priority</button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {i.status !== "RESOLVED" && <button className="btn btn-green" onClick={() => patch({ status: "RESOLVED", note: "Closed by admin" })}>Close</button>}
            {(i.status === "RESOLVED" || i.status === "REQUIRES_REVIEW") && <button className="btn btn-red" onClick={() => patch({ status: "IN_PROGRESS", note: "Reopened by admin" })}>Reopen</button>}
          </div>
          {msg && <p className="text-sm text-rose-600">{msg}</p>}
        </section>
      </IncidentView>
    </>
  );
}
