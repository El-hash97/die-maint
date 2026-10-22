import { asc } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { isAdmin } from "@/lib/admin-auth";
import { TABS, tableOf, type Item } from "@/lib/master";
import { logout } from "./actions";
import { ItemRow, LoginForm } from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  if (!(await isAdmin())) {
    return (
      <div className="mx-auto max-w-xs">
        <h1 className="mb-5 text-2xl font-bold">Master Data</h1>
        <LoginForm />
      </div>
    );
  }

  const { tab } = await searchParams;
  const entity = TABS.find((t) => t.key === tab)?.key ?? "machines";
  const t = tableOf(entity);
  const rows: Item[] = await db.select().from(t).orderBy(...(entity === "pics" ? [asc(t.name)] : [asc(t.sortOrder), asc(t.name)]));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Master Data</h1>
          <p className="mb-5 text-slate-500">Daftar pilihan untuk form dan filter. Nonaktifkan untuk menyembunyikan tanpa menghapus riwayat temuan.</p>
        </div>
        <form action={logout}>
          <button className="text-sm text-slate-500 underline">Keluar</button>
        </form>
      </div>
      <div className="mb-4 flex gap-1 border-b">
        {TABS.map((x) => (
          <Link
            key={x.key}
            href={`/admin?tab=${x.key}`}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${x.key === entity ? "border-toyota text-toyota" : "border-transparent text-slate-600 hover:text-slate-900"}`}
          >
            {x.label}
          </Link>
        ))}
      </div>
      <div className="rounded-lg border shadow-sm">
        <div className="border-b bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">Tambah baru</div>
        <ItemRow key={`${entity}-new`} entity={entity} />
        <div className="border-b bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">{rows.length} data</div>
        {rows.map((r) => (
          <ItemRow key={`${entity}-${r.id}`} entity={entity} item={r} />
        ))}
      </div>
    </div>
  );
}
