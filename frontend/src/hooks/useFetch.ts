import { useCallback, useEffect, useState } from "react";
import { api, errMsg } from "../services/api";

export function useFetch<T>(url: string | null, params?: object) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params ?? {});

  const load = useCallback(() => {
    if (!url) return;
    setLoading(true);
    api
      .get(url, { params: params ? JSON.parse(key) : undefined })
      .then((r) => {
        setData(r.data);
        setError("");
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [url, key]);

  useEffect(load, [load]);
  return { data, error, loading, reload: load, setData };
}
