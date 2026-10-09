import { requireTestDatabase } from "./requireTestDatabase";
import { saveWarLogs, getLatestWarLogs, getWarLogsByWarId } from "../db/warLogs";
import { saveWar } from "../db/wars";
import { pool } from "../db/pool";
import type { War } from "../types/db";

const WAR_1: War = { startDate: "2026-09-10", startIndex: 901, periodType: "warDay" };
const WAR_2: War = { startDate: "2026-09-17", startIndex: 902, periodType: "warDay" };
const TEST_START_DATES = [WAR_1.startDate, WAR_2.startDate];

async function cleanup() {
    await pool.query("DELETE FROM war_logs WHERE war_start_date = ANY($1)", [TEST_START_DATES]);
    await pool.query("DELETE FROM wars WHERE start_date = ANY($1)", [TEST_START_DATES]);
}

async function main() {
    requireTestDatabase();

    await pool.query(
        `INSERT INTO clan_members (tag, name, role, join_date)
    VALUES ('#TEST1', 'Test Un', 'member', CURRENT_DATE)
    ON CONFLICT (tag) DO NOTHING;`,
    );

    const knownTags = new Set(["#TEST1"]);

    await cleanup();

    await saveWar(WAR_1);
    await saveWar(WAR_2);
    await saveWarLogs(WAR_1, "2026-09-10", [{ tag: "#TEST1", fame: 1600 }], knownTags);
    await saveWarLogs(WAR_2, "2026-09-17", [{ tag: "#TEST1", fame: 2200 }], knownTags);

    console.log("--- getWarLogsByWarId('901') (expected: fame 1600) ---");
    console.table(await getWarLogsByWarId("901"));

    console.log("--- getLatestWarLogs() (expected: war_id 902, fame 2200) ---");
    console.table(await getLatestWarLogs());

    await saveWarLogs(WAR_2, "2026-09-18", [{ tag: "#TEST1", fame: 2500 }], knownTags);

    console.log("--- getWarLogsByWarId('902') after update (expected: 1 row, fame 2500) ---");
    console.table(await getWarLogsByWarId("902"));

    await saveWar({ ...WAR_1, periodType: "training" });

    const wars = await pool.query(
        `SELECT start_date::text AS "startDate", start_index, period_type
        FROM wars
        WHERE start_date = ANY($1)
        ORDER BY start_date;`,
        [TEST_START_DATES],
    );

    console.log("--- wars after saving a war twice (expected: 2 rows, both warDay) ---");
    console.table(wars.rows);

    await cleanup();
    await pool.query("DELETE FROM clan_members WHERE tag = '#TEST1'");
    await pool.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
