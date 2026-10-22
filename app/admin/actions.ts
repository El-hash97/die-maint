"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { isAdmin, loginAdmin, logoutAdmin } from "@/lib/admin-auth";
import { ENTITIES, tableOf } from "@/lib/master";

type State = { error?: string; ok?: string } | undefined;

const EXPIRED = { error: "Sesi habis. Muat ulang halaman lalu masukkan PIN lagi." };
const pgCode = (e: unknown) => {
  const x = e as { code?: string; cause?: { code?: string } };
  return x?.code ?? x?.cause?.code;
};

const saveSchema = z.object({
  entity: z.enum(ENTITIES),
  id: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().int().positive().optional()),
  name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
  group: z.string().trim().max(50).optional().transform((v) => v || null),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.preprocess((v) => v === "on", z.boolean()),
});

export async function login(_: State, fd: FormData): Promise<State> {
  try {
    if (!(await loginAdmin(String(fd.get("pin") ?? "")))) return { error: "PIN salah" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal login" };
  }
  revalidatePath("/admin");
}

export async function logout() {
  await logoutAdmin();
  revalidatePath("/admin");
}

export async function saveItem(_: State, fd: FormData): Promise<State> {
  if (!(await isAdmin())) return EXPIRED;
  const p = saveSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  const { entity, id, name, group, sortOrder, isActive } = p.data;
  const t = tableOf(entity);
  const v = { name, isActive, ...(entity !== "pics" && { sortOrder }), ...(entity === "dies" && { group }) };
  try {
    if (id) await db.update(t).set(v).where(eq(t.id, id));
    else await db.insert(t).values(v);
  } catch (e) {
    if (pgCode(e) === "23505") return { error: `"${name}" sudah ada` };
    throw e;
  }
  revalidatePath("/admin");
  return { ok: id ? "Tersimpan" : "Ditambahkan" };
}

export async function removeItem(_: State, fd: FormData): Promise<State> {
  if (!(await isAdmin())) return EXPIRED;
  const p = saveSchema.pick({ entity: true, id: true }).safeParse(Object.fromEntries(fd));
  if (!p.success || !p.data.id) return { error: "Data tidak valid" };
  const t = tableOf(p.data.entity);
  try {
    await db.delete(t).where(eq(t.id, p.data.id));
  } catch (e) {
    if (pgCode(e) === "23503") return { error: "Masih dipakai temuan. Nonaktifkan saja, jangan dihapus." };
    throw e;
  }
  revalidatePath("/admin");
}
