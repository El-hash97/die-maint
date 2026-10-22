"use client";
import imageCompression from "browser-image-compression";
import { useState } from "react";

export function PhotoInput({ name, label }: { name: string; label: string }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onFile(f?: File) {
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      const small = await imageCompression(f, { maxSizeMB: 0.5, maxWidthOrHeight: 1600, useWebWorker: true });
      const fd = new FormData();
      fd.append("file", small, f.name);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      setUrl((await res.json()).url);
    } catch {
      setErr("Upload gagal, coba lagi");
    }
    setBusy(false);
  }

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={url} />
      <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="input" />
      {busy && <p className="mt-1 text-sm text-slate-500">Mengunggah…</p>}
      {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url && <img src={url} alt={label} className="mt-2 h-32 rounded border object-cover" />}
    </div>
  );
}
