import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { dies, machines, pics } from "@/db/schema";
import { PAGE_SIZE, listFindings, statusCounts } from "@/lib/queries";
import { BADGE, STATUSES, STATUS_LABEL } from "@/lib/validation";

export const dynamic = "force-dynamic";

const fmtDate = (d: string) => d.split("-").reverse().join("/");

export default async function ResultPage({ searchParams }: PageProps<"/result">) {
  const sp = await searchParams;
  const f = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const page = Math.max(1, Number(f.page) || 1);
  const [rows, counts, m, d, p] = await Promise.all([
    listFindings(f, page),
    statusCounts(f),
    db.select().from(machines).orderBy(asc(machines.sortOrder)),
    db.select().from(dies).orderBy(asc(dies.sortOrder)),
    db.select().from(pics).orderBy(asc(pics.name)),
  ]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (n: number) => new URLSearchParams({ ...(Object.fromEntries(Object.entries(f).filter(([, v]) => v)) as Record<string, string>), page: String(n) }).toString();
  const sel = (name: string, label: string, opts: { id: number; name: string }[]) => (
    <div>
      <label className="label">{label}</label>
      <select name={name} defaultValue={f[name] ?? ""} className="input">
        <option value="">Semua</option>
        {opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Result Temuan</h1>
          <p className="text-slate-500">Pantau dan tindak lanjuti temuan abnormal die</p>
        </div>
        <Link href="/form" className="btn bg-green-600 hover:bg-green-700">+ Input Baru</Link>
      </div>

      <form className="mb-5 rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Filter Data</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><label className="label">Dari Tanggal</label><input type="date" name="from" defaultValue={f.from} className="input" /></div>
          <div><label className="label">Sampai Tanggal</label><input type="date" name="to" defaultValue={f.to} className="input" /></div>
          {sel("machine", "Mesin / Equipment", m)}
          {sel("die", "Die", d)}
          {sel("pic", "PIC", p)}
          <div>
            <label className="label">Shift</label>
            <select name="shift" defaultValue={f.shift ?? ""} className="input">
              <option value="">Semua</option><option value="RED">Red</option><option value="WHITE">White</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" defaultValue={f.status ?? ""} className="input">
              <option value="">Semua</option>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </div>
          <div><label className="label">Cari</label><input name="q" defaultValue={f.q} placeholder="Temuan / analisa / perbaikan" className="input" /></div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="btn bg-toyota hover:bg-red-700">Terapkan</button>
          <Link href="/result" className="btn bg-slate-500 hover:bg-slate-600">Reset</Link>
        </div>
      </form>

      <div className="mb-3 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">Total {total}</span>
        {STATUSES.map((s) => (
          <span key={s} className={`rounded-full px-3 py-1 font-medium ${BADGE[s]}`}>{STATUS_LABEL[s]} {counts[s] ?? 0}</span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {["No", "Tanggal", "Jam", "Temuan Abnormal", "Mesin", "Die", "Foto", "PIC", "Shift", "Status"].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-3 py-3">{r.no}</td>
                <td className="whitespace-nowrap px-3 py-3">{fmtDate(r.foundDate)}</td>
                <td className="px-3 py-3">{r.foundTime.slice(0, 5)}</td>
                <td className="min-w-64 px-3 py-3"><Link href={`/result/${r.id}`} className="font-medium text-slate-900 hover:text-toyota">{r.abnormalFinding}</Link></td>
                <td className="px-3 py-3">{r.machine}</td>
                <td className="whitespace-nowrap px-3 py-3">{r.die}</td>
                <td className="px-3 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {r.imgProblemUrl && <img src={r.imgProblemUrl} alt="" className="h-12 w-12 rounded object-cover" />}
                </td>
                <td className="px-3 py-3">{r.pic}</td>
                <td className="px-3 py-3">{r.shift === "RED" ? "Red" : "White"}</td>
                <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE[r.status]}`}>{STATUS_LABEL[r.status]}</span></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={10} className="px-3 py-10 text-center text-slate-500">Belum ada temuan</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-500">Halaman {page} / {pages}</span>
        <div className="flex gap-2">
          {page > 1 && <Link href={`?${qs(page - 1)}`} className="rounded border px-3 py-1.5 hover:bg-slate-50">‹ Sebelumnya</Link>}
          {page < pages && <Link href={`?${qs(page + 1)}`} className="rounded border px-3 py-1.5 hover:bg-slate-50">Berikutnya ›</Link>}
        </div>
      </div>
    </div>
  );
}
