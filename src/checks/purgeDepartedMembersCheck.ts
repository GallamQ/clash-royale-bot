import { deepStrictEqual } from "node:assert/strict";
import { requireTestDatabase } from "./requireTestDatabase";
import { addAbsence } from "../db/absences";
import { purgeDepartedMembers } from "../db/members";
import { pool } from "../db/pool";
import { saveWarResults } from "../db/warResults";
import { saveWar } from "../db/wars";
import { getPurgeCutoffDate } from "../rules/departedMembers";
import type { War } from "../types/db";
import { addDays } from "../utils/addDays";
import { getClanToday } from "../utils/clanToday";

const WAR: War = { startDate: "2090-04-04", startIndex: 907, periodType: "warDay" };
const TEST_TAGS = ["#PURGE1", "#PURGE2", "#PURGE3", "#PURGE4", "#PURGE5"];
const KEPT_TAGS = ["#PURGE2", "#PURGE3", "#PURGE4"];

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

async function cleanUp() {
    await pool.query("DELETE FROM absences WHERE tag = ANY($1)", [TEST_TAGS]);
    await pool.query("DELETE FROM war_logs WHERE war_start_date = $1", [WAR.startDate]);
    await pool.query("DELETE FROM war_results WHERE war_start_date = $1", [WAR.startDate]);
    await pool.query("DELETE FROM wars WHERE start_date = $1", [WAR.startDate]);
    await pool.query("DELETE FROM clan_members WHERE tag = ANY($1)", [TEST_TAGS]);
}

async function readTags(table: string): Promise<string[]> {
    const result = await pool.query<{ tag: string }>(
        `SELECT tag FROM ${table} WHERE tag = ANY($1) ORDER BY tag;`,
        [TEST_TAGS],
    );

    return result.rows.map((row) => row.tag);
}

async function main() {
    requireTestDatabase();

    const today = getClanToday();
    const cutoff = getPurgeCutoffDate(today);
    const longAgo = addDays(cutoff, -200);
    const dayBeforeCutoff = addDays(cutoff, -1);

    await cleanUp();

    await pool.query(
        `INSERT INTO clan_members (tag, name, role, join_date, left_at)
        VALUES ('#PURGE1', 'Long Gone', 'member', $1, $2),
            ('#PURGE2', 'Left Today', 'member', $1, $1),
            ('#PURGE3', 'Still Active', 'member', $1, NULL),
            ('#PURGE4', 'Left At Cutoff', 'member', $1, $3),
            ('#PURGE5', 'Left Day Before', 'member', $1, $4);`,
        [today, longAgo, cutoff, dayBeforeCutoff],
    );

    await saveWar(WAR);
    await saveWarResults(
        WAR.startDate,
        TEST_TAGS.map((tag) => ({ tag, fame: 100, exempt: false, role: "member" })),
    );

    for (const tag of TEST_TAGS) {
        await addAbsence(tag, today, today);
        await pool.query("INSERT INTO war_logs (war_start_date, tag, fame) VALUES ($1, $2, 100);", [
            WAR.startDate,
            tag,
        ]);
    }

    const purgedTags = await purgeDepartedMembers(cutoff);

    expectEqual("purged tags are the ones departed strictly before the cutoff", purgedTags.sort(), [
        "#PURGE1",
        "#PURGE5",
    ]);
    expectEqual("remaining members are the ones kept", await readTags("clan_members"), KEPT_TAGS);
    expectEqual("remaining absences are the ones kept", await readTags("absences"), KEPT_TAGS);
    expectEqual(
        "remaining war results are the ones kept",
        await readTags("war_results"),
        KEPT_TAGS,
    );
    expectEqual("remaining war logs are the ones kept", await readTags("war_logs"), KEPT_TAGS);

    const secondPurge = await purgeDepartedMembers(cutoff);

    expectEqual("a second purge removes nothing", secondPurge, []);
    expectEqual(
        "members are unchanged after a second purge",
        await readTags("clan_members"),
        KEPT_TAGS,
    );

    await cleanUp();
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
