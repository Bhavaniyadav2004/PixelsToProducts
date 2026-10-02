import axios from "axios";

export const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && !location.pathname.startsWith("/login")) {
      localStorage.removeItem("sp_token");
      location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const errMsg = (e: any): string => {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x.msg).join("; ");
  return e?.message ?? "Something went wrong";
};
