import { and, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { dies, findings, machines, pics } from "@/db/schema";
import { SHIFTS, STATUSES } from "./validation";

export type Filters = Record<string, string | undefined>;
export const PAGE_SIZE = 20;

function where(f: Filters) {
  const num = (v?: string) => (v && Number.isInteger(+v) ? +v : undefined);
  const status = STATUSES.find((s) => s === f.status);
  const shift = SHIFTS.find((s) => s === f.shift);
  const q = f.q?.trim();
  return and(
    isNull(findings.deletedAt),
    f.from ? gte(findings.foundDate, f.from) : undefined,
    f.to ? lte(findings.foundDate, f.to) : undefined,
    num(f.machine) ? eq(findings.machineId, num(f.machine)!) : undefined,
    num(f.die) ? eq(findings.dieId, num(f.die)!) : undefined,
    num(f.pic) ? eq(findings.picId, num(f.pic)!) : undefined,
    shift ? eq(findings.shift, shift) : undefined,
    status ? eq(findings.status, status) : undefined,
    q ? or(ilike(findings.abnormalFinding, `%${q}%`), ilike(findings.problemAnalysis, `%${q}%`), ilike(findings.repairAction, `%${q}%`)) : undefined,
  );
}

// Dipakai juga oleh export Excel agar mengikuti filter yang sama.
export async function listFindings(f: Filters, page: number | null = 1) {
  const q = db
    .select({
      id: findings.id,
      no: findings.findingNo,
      foundDate: findings.foundDate,
      foundTime: findings.foundTime,
      abnormalFinding: findings.abnormalFinding,
      machine: machines.name,
      die: dies.name,
      problemAnalysis: findings.problemAnalysis,
      repairAction: findings.repairAction,
      followUp: findings.followUp,
      imgProblemUrl: findings.imgProblemUrl,
      imgRootCauseUrl: findings.imgRootCauseUrl,
      rootCauseNa: findings.rootCauseNa,
      imgResultUrl: findings.imgResultUrl,
      pic: pics.name,
      shift: findings.shift,
      status: findings.status,
    })
    .from(findings)
    .innerJoin(machines, eq(findings.machineId, machines.id))
    .innerJoin(dies, eq(findings.dieId, dies.id))
    .innerJoin(pics, eq(findings.picId, pics.id))
    .where(where(f))
    .orderBy(desc(findings.foundDate), desc(findings.foundTime), desc(findings.id));
  return page ? q.limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE) : q;
}

export async function statusCounts(f: Filters) {
  const rows = await db
    .select({ status: findings.status, n: sql<number>`count(*)::int` })
    .from(findings)
    .where(where(f))
    .groupBy(findings.status);
  return Object.fromEntries(rows.map((r) => [r.status, r.n])) as Record<string, number>;
}
