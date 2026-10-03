import { requireTestDatabase } from "./requireTestDatabase";
import {
    addAbsence,
    removeAbsencesByTag,
    deleteExpiredAbsences,
    getAllAbsences,
    getActiveAbsences,
} from "../db/absences";
import { pool } from "../db/pool";

function daysFromToday(offset: number): string {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + offset);

    return date.toISOString().slice(0, 10);
}

async function main() {
    requireTestDatabase();

    await pool.query(
        `INSERT INTO clan_members (tag, name, role, join_date)
    VALUES ('#TEST1', 'Test Un', 'member', CURRENT_DATE)
    ON CONFLICT (tag) DO NOTHING;`,
    );

    // Start from a clean state so the test can be re-run at any time
    await removeAbsencesByTag("#TEST1");

    // Three absences: expired, current, future
    await addAbsence("#TEST1", daysFromToday(-10), daysFromToday(-5));
    await addAbsence("#TEST1", daysFromToday(-1), daysFromToday(1));
    await addAbsence("#TEST1", daysFromToday(5), daysFromToday(10));

    console.log("--- All absences (expected: 3 rows) ---");
    console.table(await getAllAbsences());

    console.log("--- Active absences (expected: 1 row, the current one) ---");
    console.table(await getActiveAbsences());

    await deleteExpiredAbsences();

    console.log("--- All absences after cleanup (expected: 2 rows) ---");
    console.table(await getAllAbsences());

    // Leave nothing behind
    await removeAbsencesByTag("#TEST1");
    await pool.query("DELETE FROM clan_members WHERE tag = '#TEST1'");
    await pool.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
