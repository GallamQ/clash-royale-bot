import {
  addAbsence,
  removeAbsencesByTag,
  deleteExpiredAbsences,
  getAllAbsences,
  getActiveAbsences,
} from "../db/absences";
import { pool } from "../db/pool";

async function main() {
  // Start from a clean state so the test can be re-run at any time
  await removeAbsencesByTag("#TEST1");

  // Three absences: expired, current, future
  await addAbsence("#TEST1", "2026-09-01", "2026-09-05");
  await addAbsence("#TEST1", "2026-09-20", "2026-09-22");
  await addAbsence("#TEST1", "2026-10-15", "2026-10-20");

  console.log("--- All absences (expected: 3 rows) ---");
  console.table(await getAllAbsences());

  console.log("--- Active absences (expected: 1 row, the current one) ---");
  console.table(await getActiveAbsences());

  await deleteExpiredAbsences();

  console.log("--- All absences after cleanup (expected: 2 rows) ---");
  console.table(await getAllAbsences());

  // Leave nothing behind
  await removeAbsencesByTag("#TEST1");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});