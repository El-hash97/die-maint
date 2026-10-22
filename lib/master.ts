import { dies, machines, pics } from "@/db/schema";

export const TABS = [
  { key: "machines", label: "Mesin / Equipment" },
  { key: "dies", label: "Die" },
  { key: "pics", label: "PIC" },
] as const;

export type Entity = (typeof TABS)[number]["key"];
export const ENTITIES = TABS.map((t) => t.key) as [Entity, ...Entity[]];

// Ketiga tabel berbagi id/name/isActive; kolom lain (group, sortOrder) hanya dipakai sesuai entitas.
export const tableOf = (e: Entity) => ({ machines, dies, pics })[e] as typeof machines;

export type Item = { id: number; name: string; isActive: boolean; sortOrder?: number; group?: string | null };
