import { deepStrictEqual, rejects } from "node:assert/strict";
import { requireTestDatabase } from "./requireTestDatabase";
import { addAbsence } from "../db/absences";
import { syncClanMembers } from "../db/members";
import { pool } from "../db/pool";
import { saveWarResults } from "../db/warResults";
import { saveWar } from "../db/wars";
import type { ApiMember } from "../types/api";
import type { War } from "../types/db";
import { getClanToday } from "../utils/clanToday";

const WAR: War = { startDate: "2090-02-07", startIndex: 907, periodType: "warDay" };
const LATER_DAY = "2090-03-01";
const TEST_TAGS = ["#SYNC1", "#SYNC2", "#SYNC3", "#SYNC4", "#SYNC5", "#SYNC6"];

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

async function expectRejection(label: string, promise: Promise<unknown>) {
    try {
        await rejects(promise);
        console.log(`OK   ${label}`);
    } catch {
        failures += 1;
        console.log(`FAIL ${label}`);
        console.log("  expected: the call to be rejected");
    }
}

async function cleanUp() {
    await pool.query("DELETE FROM absences WHERE tag = ANY($1)", [TEST_TAGS]);
    await pool.query("DELETE FROM war_results WHERE war_start_date = $1", [WAR.startDate]);
    await pool.query("DELETE FROM wars WHERE start_date = $1", [WAR.startDate]);
    await pool.query("DELETE FROM clan_members WHERE tag = ANY($1)", [TEST_TAGS]);
}

async function readMember(tag: string) {
    const result = await pool.query(
        `SELECT name, left_at::text AS "leftAt", join_date::text AS "joinDate"
        FROM clan_members
        WHERE tag = $1;`,
        [tag],
    );

    return result.rows[0] ?? null;
}

async function readTestAbsenceTags(): Promise<string[]> {
    const result = await pool.query<{ tag: string }>(
        "SELECT tag FROM absences WHERE tag = ANY($1) ORDER BY tag;",
        [TEST_TAGS],
    );

    return result.rows.map((row) => row.tag);
}

async function readTestResultTags(): Promise<string[]> {
    const result = await pool.query<{ tag: string }>(
        "SELECT tag FROM war_results WHERE war_start_date = $1 ORDER BY tag;",
        [WAR.startDate],
    );

    return result.rows.map((row) => row.tag);
}

async function main() {
    requireTestDatabase();

    const today = getClanToday();

    await cleanUp();

    await pool.query(
        `INSERT INTO clan_members (tag, name, role, join_date, left_at)
        VALUES ('#SYNC1', 'Stay', 'member', '2026-01-01', NULL),
            ('#SYNC2', 'Leaves', 'member', '2026-01-01', NULL),
            ('#SYNC3', 'Vanishes', 'member', '2026-01-01', NULL),
            ('#SYNC4', 'Returns', 'member', '2026-01-01', '2026-10-01'),
            ('#SYNC5', 'Stays Away', 'member', '2026-01-01', '2026-09-01');`,
    );

    await saveWar(WAR);
    await saveWarResults(WAR.startDate, [
        { tag: "#SYNC2", fame: 0, exempt: false, role: "member" },
    ]);
    await addAbsence("#SYNC2", today, today);
    await addAbsence("#SYNC3", today, today);

    const apiMembers: ApiMember[] = [
        { tag: "#SYNC1", name: "Stay Renamed", role: "member" },
        { tag: "#SYNC4", name: "Returns", role: "member" },
        { tag: "#SYNC6", name: "Newcomer", role: "member" },
    ];

    await syncClanMembers(apiMembers, today);

    expectEqual("staying member is renamed and stays active", await readMember("#SYNC1"), {
        name: "Stay Renamed",
        leftAt: null,
        joinDate: "2026-01-01",
    });
    expectEqual(
        "leaving member with history is marked as departed today",
        await readMember("#SYNC2"),
        { name: "Leaves", leftAt: today, joinDate: "2026-01-01" },
    );
    expectEqual("leaving member without history is deleted", await readMember("#SYNC3"), null);
    expectEqual("returning member is restored with its join date", await readMember("#SYNC4"), {
        name: "Returns",
        leftAt: null,
        joinDate: "2026-01-01",
    });
    expectEqual("member already departed is left untouched", await readMember("#SYNC5"), {
        name: "Stays Away",
        leftAt: "2026-09-01",
        joinDate: "2026-01-01",
    });
    expectEqual("new member joins today", await readMember("#SYNC6"), {
        name: "Newcomer",
        leftAt: null,
        joinDate: today,
    });
    expectEqual(
        "absences of a departed member are kept, those of a deleted one removed",
        await readTestAbsenceTags(),
        ["#SYNC2"],
    );
    expectEqual("war results of a departed member are kept", await readTestResultTags(), [
        "#SYNC2",
    ]);

    await syncClanMembers(apiMembers, LATER_DAY);

    expectEqual("departed member keeps its first departure date", await readMember("#SYNC2"), {
        name: "Leaves",
        leftAt: today,
        joinDate: "2026-01-01",
    });

    await expectRejection("empty list is rejected", syncClanMembers([], today));

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
