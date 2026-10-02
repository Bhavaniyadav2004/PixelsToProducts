import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { User } from "../types";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!localStorage.getItem("sp_token"));

  useEffect(() => {
    if (!localStorage.getItem("sp_token")) return;
    api.get("/auth/me").then((r) => setUser(r.data)).catch(() => localStorage.removeItem("sp_token")).finally(() => setLoading(false));
  }, []);

  const accept = (data: any) => {
    localStorage.setItem("sp_token", data.access_token);
    setUser(data.user);
    return data.user as User;
  };

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        login: async (email, password) => accept((await api.post("/auth/login", { email, password })).data),
        register: async (name, email, password) => accept((await api.post("/auth/register", { name, email, password })).data),
        logout: () => {
          localStorage.removeItem("sp_token");
          setUser(null);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
