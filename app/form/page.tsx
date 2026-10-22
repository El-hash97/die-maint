import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { dies, machines, pics } from "@/db/schema";
import { FindingForm } from "./form";

export const dynamic = "force-dynamic";

// Zona waktu pabrik (WIB, UTC+7)
const nowWib = () => new Date(Date.now() + 7 * 3600_000).toISOString();

export default async function FormPage() {
  const [m, d, p] = await Promise.all([
    db.select({ id: machines.id, name: machines.name }).from(machines).where(eq(machines.isActive, true)).orderBy(asc(machines.sortOrder)),
    db.select({ id: dies.id, name: dies.name }).from(dies).where(eq(dies.isActive, true)).orderBy(asc(dies.sortOrder)),
    db.select({ id: pics.id, name: pics.name }).from(pics).where(eq(pics.isActive, true)).orderBy(asc(pics.name)),
  ]);
  const iso = nowWib();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Input Temuan Baru</h1>
      <p className="mb-5 text-slate-500">Catat temuan abnormal die secara cepat</p>
      <div className="rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b bg-slate-50 px-6 py-4 text-sm font-bold uppercase tracking-wide text-slate-500">Formulir Pencatatan Temuan</div>
        <FindingForm machines={m} dies={d} pics={p} today={iso.slice(0, 10)} now={iso.slice(11, 16)} />
      </div>
    </div>
  );
}
