import { requireTestDatabase } from "./requireTestDatabase";
import {
    addAbsence,
    removeAbsencesByTag,
    deleteExpiredAbsences,
    getAllAbsences,
    getActiveAbsences,
} from "../db/absences";
import { pool } from "../db/pool";
import { getClanToday } from "../utils/clanToday";

function daysFrom(today: string, offset: number): string {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);

    return date.toISOString().slice(0, 10);
}

async function main() {
    requireTestDatabase();

    const today = getClanToday();

    await pool.query(
        `INSERT INTO clan_members (tag, name, role, join_date)
    VALUES ('#TEST1', 'Test Un', 'member', $1)
    ON CONFLICT (tag) DO NOTHING;`,
        [today],
    );

    await removeAbsencesByTag("#TEST1");

    await addAbsence("#TEST1", daysFrom(today, -10), daysFrom(today, -5));
    await addAbsence("#TEST1", daysFrom(today, -1), daysFrom(today, 1));
    await addAbsence("#TEST1", daysFrom(today, 5), daysFrom(today, 10));

    console.log("--- All absences (expected: 3 rows) ---");
    console.table(await getAllAbsences());

    console.log("--- Active absences (expected: 1 row, the current one) ---");
    console.table(await getActiveAbsences(today));

    await deleteExpiredAbsences(today);

    console.log("--- All absences after cleanup (expected: 2 rows) ---");
    console.table(await getAllAbsences());

    await removeAbsencesByTag("#TEST1");
    await pool.query("DELETE FROM clan_members WHERE tag = '#TEST1'");
    await pool.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
