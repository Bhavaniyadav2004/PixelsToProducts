import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-brand-600 text-white">
        <div className="mx-auto max-w-5xl px-4 py-3"><Link to="/" className="text-lg font-semibold">StreetPulse</Link></div>
      </header>
      <div className="mx-auto mt-10 w-full max-w-sm px-4">
        <form onSubmit={submit} className="card space-y-4 p-6">
          <h1 className="text-xl font-semibold">{isRegister ? "Create an account" : "Sign in"}</h1>
          {isRegister && (
            <div><label className="label">Full name</label><input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></div>
          )}
          <div><label className="label">Email address</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="label">Password</label><input className="input" type="password" required minLength={isRegister ? 6 : 1} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <p className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-800">{error}</p>}
          <button className="btn btn-primary w-full" disabled={busy}>{isRegister ? "Register" : "Sign in"}</button>
          <button type="button" className="w-full text-center text-sm text-brand-600 hover:underline" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Already registered? Sign in" : "New here? Create an account"}
          </button>
        </form>
        {!isRegister && (
          <div className="mt-4 rounded border border-dashed border-gray-400 p-3 text-xs text-gray-600">
            Demo accounts - click to fill:
            <div className="mt-2 flex gap-2">
              {DEMO.map(([l, e, p]) => (
                <button type="button" key={l} className="btn btn-ghost px-2 py-1 text-xs" onClick={() => { setEmail(e); setPassword(p); }}>{l}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
