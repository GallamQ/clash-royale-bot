import { requireTestDatabase } from "./requireTestDatabase";
import { saveWar } from "../db/wars";
import { getLatestFrozenWar, saveWarResults } from "../db/warResults";
import { pool } from "../db/pool";
import type { War } from "../types/db";
import type { WarResult } from "../rules/warResults";

const WAR_1: War = { startDate: "2090-01-03", startIndex: 903, periodType: "warDay" };
const WAR_2: War = { startDate: "2090-01-10", startIndex: 910, periodType: "warDay" };
const TEST_START_DATES = [WAR_1.startDate, WAR_2.startDate];
const TEST_TAGS = ["#TESTRES1", "#TESTRES2"];

const RESULTS: WarResult[] = [
    { tag: "#TESTRES1", fame: 500, exempt: false, role: "member" },
    { tag: "#TESTRES2", fame: 0, exempt: true, role: "elder" },
];

async function cleanup() {
    await pool.query("DELETE FROM war_results WHERE war_start_date = ANY($1)", [TEST_START_DATES]);
    await pool.query("DELETE FROM wars WHERE start_date = ANY($1)", [TEST_START_DATES]);
    await pool.query("DELETE FROM clan_members WHERE tag = ANY($1)", [TEST_TAGS]);
}

async function readResults(warStartDate: string) {
    const result = await pool.query(
        `SELECT war_start_date::text AS "warStartDate", tag, fame, exempt, role,
            frozen_at IS NOT NULL AS "hasFrozenAt"
        FROM war_results
        WHERE war_start_date = $1
        ORDER BY tag;`,
        [warStartDate],
    );

    return result.rows;
}

async function main() {
    requireTestDatabase();

    await cleanup();

    await pool.query(
        `INSERT INTO clan_members (tag, name, role, join_date)
        VALUES ('#TESTRES1', 'Test Un', 'member', '2026-01-01'),
            ('#TESTRES2', 'Test Deux', 'elder', '2026-01-01');`,
    );

    await saveWar(WAR_1);
    await saveWar(WAR_2);

    await saveWarResults(WAR_1.startDate, RESULTS);

    console.log("--- first freeze (expected: 2 rows, fame 500 / 0, exempt false / true) ---");
    console.table(await readResults(WAR_1.startDate));

    const otherValues = RESULTS.map((result) => ({
        ...result,
        fame: 999,
        exempt: !result.exempt,
        role: "coLeader",
    }));

    await saveWarResults(WAR_1.startDate, otherValues);

    console.log("--- second freeze with other values (expected: unchanged) ---");
    console.table(await readResults(WAR_1.startDate));

    const withUnknownTag: WarResult[] = [
        { tag: "#TESTRES1", fame: 1, exempt: false, role: "member" },
        { tag: "#TESTUNKNOWN", fame: 1, exempt: false, role: "member" },
    ];

    try {
        await saveWarResults(WAR_2.startDate, withUnknownTag);
        console.log("Unexpected: no error for an unknown tag.");
    } catch (error) {
        console.log(`Expected error: ${error instanceof Error ? error.message : error}`);
    }

    const rolledBack = await readResults(WAR_2.startDate);

    console.log(`--- rows after the failed freeze (expected: 0): ${rolledBack.length} ---`);

    const firstFrozen = await getLatestFrozenWar();

    console.log(
        `--- latest frozen war (expected: ${WAR_1.startDate}): ${firstFrozen?.startDate} ---`,
    );
    console.table(firstFrozen?.results);

    await saveWarResults(WAR_2.startDate, [
        { tag: "#TESTRES2", fame: 1200, exempt: false, role: "elder" },
    ]);

    const secondFrozen = await getLatestFrozenWar();

    console.log(
        `--- latest frozen war (expected: ${WAR_2.startDate}): ${secondFrozen?.startDate} ---`,
    );
    console.table(secondFrozen?.results);

    await cleanup();
    await pool.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
