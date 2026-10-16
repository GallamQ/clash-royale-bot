import { deepStrictEqual } from "node:assert/strict";
import { requireTestDatabase } from "./requireTestDatabase";
import { saveWarLogs, getWarLogsByStartDate } from "../db/warLogs";
import { saveWar } from "../db/wars";
import { pool } from "../db/pool";
import type { War } from "../types/db";

const WAR_1: War = { startDate: "2026-09-10", startIndex: 901, periodType: "warDay" };
const WAR_2: War = { startDate: "2026-09-17", startIndex: 902, periodType: "warDay" };
const TEST_START_DATES = [WAR_1.startDate, WAR_2.startDate];

let failures = 0;

function expectEqual(label: string, actual: unknown, expected: unknown) {
    try {
        deepStrictEqual(actual, expected);
        console.log(`OK   ${label}`);
    } catch {
        failures += 1;
        console.log(`FAIL ${label}`);
        console.log("  expected:", expected);
        console.log("  actual:  ", actual);
    }
}

async function cleanup() {
    await pool.query("DELETE FROM war_logs WHERE war_start_date = ANY($1)", [TEST_START_DATES]);
    await pool.query("DELETE FROM wars WHERE start_date = ANY($1)", [TEST_START_DATES]);
}

async function readFames(startDate: string) {
    const logs = await getWarLogsByStartDate(startDate);

    return logs.map((log) => ({ tag: log.tag, fame: log.fame }));
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
    await saveWarLogs(
        WAR_1,
        "2026-09-10",
        [
            { tag: "#TEST1", fame: 1600 },
            { tag: "#UNKNOWN", fame: 50 },
        ],
        knownTags,
    );
    await saveWarLogs(WAR_2, "2026-09-17", [{ tag: "#TEST1", fame: 2200 }], knownTags);

    expectEqual("logs of the first war (unknown tag ignored)", await readFames(WAR_1.startDate), [
        { tag: "#TEST1", fame: 1600 },
    ]);
    expectEqual("logs of the second war", await readFames(WAR_2.startDate), [
        { tag: "#TEST1", fame: 2200 },
    ]);

    await saveWarLogs(WAR_2, "2026-09-18", [{ tag: "#TEST1", fame: 2500 }], knownTags);

    expectEqual("logs of the second war after an update", await readFames(WAR_2.startDate), [
        { tag: "#TEST1", fame: 2500 },
    ]);

    await saveWar({ ...WAR_1, periodType: "training" });

    const wars = await pool.query<{ period_type: string }>(
        `SELECT period_type
        FROM wars
        WHERE start_date = ANY($1)
        ORDER BY start_date;`,
        [TEST_START_DATES],
    );

    expectEqual(
        "period types after saving a war twice",
        wars.rows.map((row) => row.period_type),
        ["warDay", "warDay"],
    );

    await cleanup();
    await pool.query("DELETE FROM clan_members WHERE tag = '#TEST1'");
    await pool.end();

    if (failures > 0) {
        console.log(`${failures} check(s) failed.`);
        process.exit(1);
    }

    console.log("All checks passed.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
