import { deepStrictEqual } from "node:assert/strict";
import { requireTestDatabase } from "./requireTestDatabase";
import { addAbsence, getActiveAbsences, getAllAbsences, removeAbsencesByTag } from "../db/absences";
import { getAllClanMembers, getAllClanTags, getClanMemberByTag } from "../db/members";
import { pool } from "../db/pool";
import { getClanToday } from "../utils/clanToday";

const ACTIVE_TAG = "#TEST1";
const DEPARTED_TAG = "#TEST2";
const TEST_TAGS = [ACTIVE_TAG, DEPARTED_TAG];

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

function onlyTestTags(tags: string[]): string[] {
    return tags.filter((tag) => TEST_TAGS.includes(tag));
}

async function cleanUp() {
    for (const tag of TEST_TAGS) {
        await removeAbsencesByTag(tag);
    }

    await pool.query("DELETE FROM clan_members WHERE tag = ANY($1)", [TEST_TAGS]);
}

async function main() {
    requireTestDatabase();

    const today = getClanToday();

    await cleanUp();

    await pool.query(
        `INSERT INTO clan_members (tag, name, role, join_date, left_at)
        VALUES ($1, 'Test Un', 'member', $3, NULL),
            ($2, 'Test Deux', 'member', $3, $3);`,
        [ACTIVE_TAG, DEPARTED_TAG, today],
    );

    await addAbsence(ACTIVE_TAG, today, today);
    await addAbsence(DEPARTED_TAG, today, today);

    const members = await getAllClanMembers();
    const tags = await getAllClanTags();
    const absences = await getAllAbsences();
    const activeAbsences = await getActiveAbsences(today);

    expectEqual(
        "all members exclude a departed member",
        onlyTestTags(members.map((member) => member.tag)),
        [ACTIVE_TAG],
    );
    expectEqual("all tags exclude a departed member", onlyTestTags([...tags]), [ACTIVE_TAG]);
    expectEqual(
        "active member is found by tag",
        (await getClanMemberByTag(ACTIVE_TAG))?.tag,
        ACTIVE_TAG,
    );
    expectEqual(
        "departed member is not found by tag",
        await getClanMemberByTag(DEPARTED_TAG),
        null,
    );
    expectEqual(
        "all absences exclude a departed member",
        onlyTestTags(absences.map((absence) => absence.tag)),
        [ACTIVE_TAG],
    );
    expectEqual(
        "active absences exclude a departed member",
        onlyTestTags(activeAbsences.map((absence) => absence.tag)),
        [ACTIVE_TAG],
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
