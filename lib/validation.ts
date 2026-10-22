import { z } from "zod";

export const STATUSES = ["OK", "NG", "MONITORING", "OK_ABNORMAL", "PENDING_PART"] as const;
export const SHIFTS = ["RED", "WHITE"] as const;
export const STATUS_LABEL: Record<(typeof STATUSES)[number], string> = {
  OK: "OK",
  NG: "NG",
  MONITORING: "Monitoring",
  OK_ABNORMAL: "OK Abnormal",
  PENDING_PART: "Pending Part",
};

const text = z.string().trim().optional().transform((v) => v || null);

export const findingSchema = z.object({
  foundDate: z.string().min(1, "Tanggal wajib diisi"),
  foundTime: z.string().min(1, "Jam wajib diisi"),
  abnormalFinding: z.string().trim().min(1, "Temuan wajib diisi"),
  machineId: z.coerce.number().int().positive("Mesin wajib dipilih"),
  dieId: z.coerce.number().int().positive("Die wajib dipilih"),
  picId: z.coerce.number().int().positive("PIC wajib dipilih"),
  shift: z.enum(SHIFTS, "Shift wajib dipilih"),
  status: z.enum(STATUSES).default("MONITORING"),
  problemAnalysis: text,
  repairAction: text,
  imgProblemUrl: text,
  imgRootCauseUrl: text,
  rootCauseNa: z.preprocess((v) => v === "true", z.boolean()),
});
