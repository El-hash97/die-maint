"use server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { findings, findingStatusLogs } from "@/db/schema";
import { findingSchema } from "@/lib/validation";

export async function createFinding(_: { error?: string } | undefined, fd: FormData) {
  const parsed = findingSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const [row] = await db.insert(findings).values(parsed.data).returning({ id: findings.id });
  await db.insert(findingStatusLogs).values({ findingId: row.id, newStatus: parsed.data.status, note: "Input awal" });
  redirect("/result");
}
