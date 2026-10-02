import { FormEvent, useState } from "react";
import { PageTitle } from "../../components/Layout";
import { Loading } from "../../components/StatCard";
import { useFetch } from "../../hooks/useFetch";
import { api, errMsg } from "../../services/api";
import { pretty } from "../../utils/format";

interface U { id: number; name: string; email: string; role: string; department: string | null; department_id: number | null }
interface Dept { id: number; name: string }

export default function Users() {
  const { data, error, reload } = useFetch<U[]>("/admin/users");
  const depts = useFetch<Dept[]>("/departments");
  const [f, setF] = useState({ name: "", email: "", password: "", role: "MUNICIPAL_MEMBER", department_id: "" });
  const [msg, setMsg] = useState("");

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/admin/users", { ...f, department_id: f.department_id ? Number(f.department_id) : null });
      setF({ ...f, name: "", email: "", password: "" });
      reload();
    } catch (err) {
      setMsg(errMsg(err));
    }
  };
  const update = async (id: number, body: object) => {
    await api.patch(`/admin/users/${id}`, body);
    reload();
  };

  if (!data) return <Loading error={error} />;
  return (
    <>
      <PageTitle title="Users" />
      <form onSubmit={create} className="card mb-5 grid gap-3 md:grid-cols-6">
        <input className="input" placeholder="Name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="input" type="email" placeholder="Email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className="input" type="password" placeholder="Password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <select className="input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
          {["CITIZEN", "MUNICIPAL_MEMBER", "ADMIN"].map((r) => <option key={r} value={r}>{pretty(r)}</option>)}
        </select>
        <select className="input" value={f.department_id} onChange={(e) => setF({ ...f, department_id: e.target.value })}>
          <option value="">No department</option>
          {depts.data?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button className="btn btn-primary">Add user</button>
        {msg && <p className="text-sm text-rose-600 md:col-span-6">{msg}</p>}
      </form>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500"><tr>{["Name", "Email", "Role", "Department"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2 font-medium">{u.name}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">
                  <select className="input py-1" value={u.role} onChange={(e) => update(u.id, { role: e.target.value })}>
                    {["CITIZEN", "MUNICIPAL_MEMBER", "ADMIN"].map((r) => <option key={r} value={r}>{pretty(r)}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select className="input py-1" value={u.department_id ?? ""} onChange={(e) => update(u.id, { department_id: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">-</option>
                    {depts.data?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
