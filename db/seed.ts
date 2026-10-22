import { db } from "./index";
import { machines, dies, pics } from "./schema";

// Data awal; lengkapi dari sheet Excel List Up.
const machineNames = ["ICM 002009", "Die Core", "Die Mould", "Core Jig"];
const dieList: [string, string][] = [
  ["BC 1TR #01", "BC"],
  ["Ccase 2TR #05", "Ccase"],
];
const picNames = ["Kirsan", "Raihan Ali"];

async function main() {
  await db.insert(machines).values(machineNames.map((name, i) => ({ name, sortOrder: i }))).onConflictDoNothing();
  await db.insert(dies).values(dieList.map(([name, group], i) => ({ name, group, sortOrder: i }))).onConflictDoNothing();
  await db.insert(pics).values(picNames.map((name) => ({ name }))).onConflictDoNothing();
  console.log("seeded");
}
main();
