import { deepStrictEqual, rejects } from "node:assert/strict";
import { requireTestDatabase } from "./requireTestDatabase";
import {
    addAbsence,
    removeAbsencesByTag,
    deleteExpiredAbsences,
    getAllAbsences,
    getActiveAbsences,
} from "../db/absences";
import { pool } from "../db/pool";
import type { AbsenceWithName } from "../types/db";
import { getClanToday } from "../utils/clanToday";

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

function daysFrom(today: string, offset: number): string {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);

    return date.toISOString().slice(0, 10);
}

function testPeriods(absences: AbsenceWithName[]) {
    return absences
        .filter((absence) => absence.tag === "#TEST1")
        .map((absence) => ({ startDate: absence.startDate, endDate: absence.endDate }));
}

async function main() {
    requireTestDatabase();

    const today = getClanToday();

    const past = { startDate: daysFrom(today, -10), endDate: daysFrom(today, -5) };
    const current = { startDate: daysFrom(today, -1), endDate: daysFrom(today, 1) };
    const future = { startDate: daysFrom(today, 5), endDate: daysFrom(today, 10) };

    await pool.query(
        `INSERT INTO clan_members (tag, name, role, join_date)
        VALUES ('#TEST1', 'Test Un', 'member', $1)
        ON CONFLICT (tag) DO NOTHING;`,
        [today],
    );

    await removeAbsencesByTag("#TEST1");

    expectEqual(
        "past absence is inserted",
        await addAbsence("#TEST1", past.startDate, past.endDate),
        true,
    );
    expectEqual(
        "current absence is inserted",
        await addAbsence("#TEST1", current.startDate, current.endDate),
        true,
    );
    expectEqual(
        "future absence is inserted",
        await addAbsence("#TEST1", future.startDate, future.endDate),
        true,
    );
    expectEqual(
        "duplicate absence is not inserted",
        await addAbsence("#TEST1", current.startDate, current.endDate),
        false,
    );

    await expectRejection(
        "absence ending before it starts is rejected",
        addAbsence("#TEST1", daysFrom(today, 3), daysFrom(today, 2)),
    );

    expectEqual("all absences (duplicate ignored)", testPeriods(await getAllAbsences()), [
        past,
        current,
        future,
    ]);
    expectEqual("active absences", testPeriods(await getActiveAbsences(today)), [current]);

    await deleteExpiredAbsences(today);

    expectEqual("absences after cleanup", testPeriods(await getAllAbsences()), [current, future]);

    await removeAbsencesByTag("#TEST1");
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
