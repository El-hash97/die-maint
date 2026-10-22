"use client";
import { useActionState, useState } from "react";
import { STATUSES, STATUS_LABEL } from "@/lib/validation";
import { createFinding } from "./actions";
import { PhotoInput } from "./photo-input";

type Opt = { id: number; name: string };

export function FindingForm({ machines, dies, pics, today, now }: { machines: Opt[]; dies: Opt[]; pics: Opt[]; today: string; now: string }) {
  const [state, action, pending] = useActionState(createFinding, undefined);
  const [na, setNa] = useState(false);
  const select = (name: string, label: string, opts: Opt[]) => (
    <div>
      <label className="label">{label} <span className="text-red-600">*</span></label>
      <select name={name} required defaultValue="" className="input">
        <option value="" disabled>-- Pilih {label} --</option>
        {opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </div>
  );

  return (
    <form action={action} className="space-y-5 p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Tanggal <span className="text-red-600">*</span></label>
          <input type="date" name="foundDate" required defaultValue={today} className="input" />
        </div>
        <div>
          <label className="label">Jam <span className="text-red-600">*</span></label>
          <input type="time" name="foundTime" required defaultValue={now} className="input" />
        </div>
      </div>
      {select("machineId", "Mesin / Equipment", machines)}
      {select("dieId", "Die", dies)}
      <div>
        <label className="label">Temuan Abnormal <span className="text-red-600">*</span></label>
        <textarea name="abnormalFinding" required rows={3} placeholder="Deskripsikan temuan abnormal pada die..." className="input" />
      </div>
      <div>
        <label className="label">Analisa Problem</label>
        <textarea name="problemAnalysis" rows={2} className="input" />
      </div>
      <div>
        <label className="label">Perbaikan</label>
        <textarea name="repairAction" rows={2} className="input" />
      </div>
      <PhotoInput name="imgProblemUrl" label="Ilustrasi Problem" />
      <div>
        <label className="mb-1 flex items-center gap-2 text-sm">
          <input type="checkbox" name="rootCauseNa" value="true" checked={na} onChange={(e) => setNa(e.target.checked)} /> Ilustrasi Root Cause n/a
        </label>
        {!na && <PhotoInput name="imgRootCauseUrl" label="Ilustrasi Root Cause" />}
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {select("picId", "PIC", pics)}
        <div>
          <label className="label">Shift <span className="text-red-600">*</span></label>
          <select name="shift" required defaultValue="" className="input">
            <option value="" disabled>-- Pilih Shift --</option>
            <option value="RED">Red</option>
            <option value="WHITE">White</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue="MONITORING" className="input">
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="btn w-full bg-green-600 hover:bg-green-700 disabled:opacity-60">
        {pending ? "Menyimpan…" : "Simpan Temuan"}
      </button>
    </form>
  );
}
