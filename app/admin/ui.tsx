"use client";
import { useActionState } from "react";
import type { Entity, Item } from "@/lib/master";
import { login, removeItem, saveItem } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mx-auto max-w-xs space-y-4 rounded-lg border p-6 shadow-sm">
      <div>
        <label className="label" htmlFor="pin">PIN Admin</label>
        <input id="pin" name="pin" type="password" inputMode="numeric" autoComplete="off" required autoFocus className="input" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="btn w-full bg-toyota hover:bg-red-700 disabled:opacity-60">
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}

// Satu baris = satu form. `item` kosong = baris "Tambah".
export function ItemRow({ entity, item }: { entity: Entity; item?: Item }) {
  const [state, save, saving] = useActionState(saveItem, undefined);
  const [dstate, del, deleting] = useActionState(removeItem, undefined);
  const err = state?.error ?? dstate?.error;
  return (
    <form action={save} className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
      <input type="hidden" name="entity" value={entity} />
      <input type="hidden" name="id" value={item?.id ?? ""} />
      {/* .input = w-full, jadi lebar diatur lewat pembungkus */}
      <div className="min-w-48 flex-1">
        <input name="name" required maxLength={100} defaultValue={item?.name} placeholder="Nama" aria-label="Nama" className="input" />
      </div>
      {entity === "dies" && (
        <div className="w-32">
          <input name="group" maxLength={50} defaultValue={item?.group ?? ""} placeholder="Grup" aria-label="Grup" className="input" />
        </div>
      )}
      {entity !== "pics" && (
        <div className="w-20">
          <input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} aria-label="Urutan" title="Urutan di dropdown" className="input" />
        </div>
      )}
      <label className="flex items-center gap-1.5 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={item?.isActive ?? true} /> Aktif
      </label>
      <button disabled={saving} className="btn bg-green-600 hover:bg-green-700 disabled:opacity-60">{item ? "Simpan" : "Tambah"}</button>
      {item && (
        <button
          formAction={del}
          disabled={deleting}
          onClick={(e) => !confirm(`Hapus "${item.name}"?`) && e.preventDefault()}
          className="btn border border-red-300 !text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          Hapus
        </button>
      )}
      {err && <p className="w-full text-sm text-red-600">{err}</p>}
      {state?.ok && !err && <p className="w-full text-sm text-green-700">{state.ok}</p>}
    </form>
  );
}
