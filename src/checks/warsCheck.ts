import { requireTestDatabase } from "./requireTestDatabase";
import { saveWar, getOpenWar, closeWar } from "../db/wars";
import { saveWarLogs, getWarLogsByStartDate } from "../db/warLogs";
import { pool } from "../db/pool";
import type { War } from "../types/db";

const WAR_1: War = { startDate: "2026-07-02", startIndex: 904, periodType: "warDay" };
const WAR_2: War = { startDate: "2026-07-09", startIndex: 911, periodType: "warDay" };
const TEST_START_DATES = [WAR_1.startDate, WAR_2.startDate];
const TEST_TAGS = ["#TESTWARS1", "#TESTWARS2"];

async function cleanup() {
    await pool.query("DELETE FROM war_logs WHERE war_start_date = ANY($1)", [TEST_START_DATES]);
    await pool.query("DELETE FROM wars WHERE start_date = ANY($1)", [TEST_START_DATES]);
    await pool.query("DELETE FROM clan_members WHERE tag = ANY($1)", [TEST_TAGS]);
}

async function readEndDate(startDate: string) {
    const result = await pool.query<{ endDate: string | null }>(
        `SELECT end_date AS "endDate" FROM wars WHERE start_date = $1;`,
        [startDate],
    );

    return result.rows[0].endDate;
}

async function main() {
    requireTestDatabase();

    await cleanup();

    await pool.query(
        `INSERT INTO clan_members (tag, name, role, join_date)
        VALUES ('#TESTWARS1', 'Test Un', 'member', '2026-01-01'),
            ('#TESTWARS2', 'Test Deux', 'elder', '2026-01-01');`,
    );

    const knownTags = new Set(TEST_TAGS);

    await saveWar(WAR_1);
    await saveWar(WAR_2);

    console.log("--- getOpenWar() with two open wars (expected: the war of 2026-07-02) ---");
    console.log(await getOpenWar());

    await closeWar(WAR_1.startDate, "2026-07-06");

    console.log("--- getOpenWar() after closing the first war (expected: 2026-07-09) ---");
    console.log(await getOpenWar());

    await closeWar(WAR_1.startDate, "2026-07-07");

    console.log("--- end date after closing twice (expected: 2026-07-06, unchanged) ---");
    console.log(await readEndDate(WAR_1.startDate));

    await saveWarLogs(
        WAR_1,
        [
            { tag: "#TESTWARS1", fame: 700 },
            { tag: "#TESTWARS2", fame: 1200 },
        ],
        knownTags,
    );
    await saveWarLogs(WAR_2, [{ tag: "#TESTWARS1", fame: 50 }], knownTags);

    console.log("--- getWarLogsByStartDate(2026-07-02) (expected: 2 rows, 1200 then 700) ---");
    console.table(await getWarLogsByStartDate(WAR_1.startDate));

    const unknown = await getWarLogsByStartDate("2026-06-25");

    console.log(`--- getWarLogsByStartDate(2026-06-25) (expected: 0 rows): ${unknown.length} ---`);

    await cleanup();
    await pool.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
