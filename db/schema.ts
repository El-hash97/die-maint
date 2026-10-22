import { boolean, date, index, integer, pgEnum, pgTable, serial, text, time, timestamp } from "drizzle-orm/pg-core";

export const shiftEnum = pgEnum("shift", ["RED", "WHITE"]);
export const statusEnum = pgEnum("status", ["OK", "NG", "MONITORING", "OK_ABNORMAL", "PENDING_PART"]);

export const machines = pgTable("machines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const dies = pgTable("dies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  group: text("group"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const pics = pgTable("pics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
});

export const findings = pgTable(
  "findings",
  {
    id: serial("id").primaryKey(),
    findingNo: serial("finding_no").notNull(),
    foundDate: date("found_date").notNull(),
    foundTime: time("found_time").notNull(),
    abnormalFinding: text("abnormal_finding").notNull(),
    machineId: integer("machine_id").notNull().references(() => machines.id),
    dieId: integer("die_id").notNull().references(() => dies.id),
    problemAnalysis: text("problem_analysis"),
    repairAction: text("repair_action"),
    followUp: text("follow_up"),
    imgProblemUrl: text("img_problem_url"),
    imgRootCauseUrl: text("img_root_cause_url"),
    rootCauseNa: boolean("root_cause_na").notNull().default(false),
    imgResultUrl: text("img_result_url"),
    picId: integer("pic_id").notNull().references(() => pics.id),
    shift: shiftEnum("shift").notNull(),
    status: statusEnum("status").notNull().default("MONITORING"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("f_date").on(t.foundDate), index("f_machine").on(t.machineId), index("f_die").on(t.dieId), index("f_status").on(t.status)],
);

export const findingStatusLogs = pgTable("finding_status_logs", {
  id: serial("id").primaryKey(),
  findingId: integer("finding_id").notNull().references(() => findings.id),
  oldStatus: statusEnum("old_status"),
  newStatus: statusEnum("new_status").notNull(),
  changedBy: text("changed_by"),
  note: text("note"),
  changedAt: timestamp("changed_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
