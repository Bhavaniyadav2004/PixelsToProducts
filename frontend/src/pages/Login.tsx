import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { errMsg } from "../services/api";
import { homeFor } from "../utils/format";

const DEMO = [
  ["Citizen", "citizen@streetpulse.test", "citizen123"],
  ["Municipal", "ravi@streetpulse.test", "municipal123"],
  ["Admin", "admin@streetpulse.test", "admin123"],
];

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [isRegister, setIsRegister] = useState(params.get("register") === "1");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = isRegister ? await register(name, email, password) : await login(email, password);
      nav(homeFor(u.role), { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6">
        <h1 className="text-2xl font-bold">{isRegister ? "Create account" : "Sign in to StreetPulse"}</h1>
        {isRegister && (
          <div><label className="label">Name</label><input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></div>
        )}
        <div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Password</label><input className="input" type="password" required minLength={isRegister ? 6 : 1} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{isRegister ? "Register" : "Sign in"}</button>
        <button type="button" className="w-full text-center text-sm text-indigo-600" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Have an account? Sign in" : "New citizen? Create an account"}
        </button>
        {!isRegister && (
          <div className="border-t pt-3 text-xs text-slate-500">
            Demo accounts:
            <div className="mt-1 flex gap-2">
              {DEMO.map(([l, e, p]) => (
                <button type="button" key={l} className="btn btn-ghost px-2 py-1 text-xs" onClick={() => { setEmail(e); setPassword(p); }}>{l}</button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
