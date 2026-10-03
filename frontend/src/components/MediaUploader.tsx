import { useRef, useState } from "react";
import { api, errMsg } from "../services/api";
import { MediaItem } from "../types";

interface Props {
  onUploaded: (m: MediaItem & { id: number }) => void;
  endpoint?: string;
  extra?: Record<string, string>;
  label?: string;
  accept?: string;
}

export default function MediaUploader({ onUploaded, endpoint = "/media/upload", extra, label = "Upload", accept = "image/*,video/*" }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const send = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      Object.entries(extra ?? {}).forEach(([k, v]) => fd.append(k, v));
      const { data } = await api.post(endpoint, fd);
      onUploaded(data);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
      if (camera.current) camera.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => camera.current?.click()}>Take photo</button>
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => input.current?.click()}>{label}</button>
      </div>
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => send(e.target.files?.[0])} />
      <input ref={input} type="file" accept={accept} hidden onChange={(e) => send(e.target.files?.[0])} />
      {busy && <p className="mt-2 text-sm text-slate-500">Uploading...</p>}
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
