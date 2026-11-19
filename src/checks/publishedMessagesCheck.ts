import { deepStrictEqual } from "node:assert/strict";
import { requireTestDatabase } from "./requireTestDatabase";
import { isMessagePublished, markMessagePublished } from "../db/publishedMessages";
import { pool } from "../db/pool";

const DATE_1 = "2090-02-02";
const DATE_2 = "2090-02-09";
const TEST_DATES = [DATE_1, DATE_2];

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
    await pool.query("DELETE FROM published_messages WHERE reference_date = ANY($1)", [TEST_DATES]);
}

async function readRows() {
    const result = await pool.query(
        `SELECT kind, reference_date::text AS "referenceDate",
            published_at IS NOT NULL AS "hasPublishedAt"
        FROM published_messages
        WHERE reference_date = ANY($1)
        ORDER BY kind, reference_date;`,
        [TEST_DATES],
    );

    return result.rows;
}

async function main() {
    requireTestDatabase();

    await cleanup();

    expectEqual("nothing published yet", await isMessagePublished("podium", DATE_1), false);

    await markMessagePublished("podium", DATE_1);

    expectEqual(
        "podium of the first date is published",
        await isMessagePublished("podium", DATE_1),
        true,
    );
    expectEqual(
        "another kind on the same date is not published",
        await isMessagePublished("kickList", DATE_1),
        false,
    );
    expectEqual(
        "the same kind on another date is not published",
        await isMessagePublished("podium", DATE_2),
        false,
    );

    await markMessagePublished("podium", DATE_1);

    expectEqual("marking twice keeps a single row", await readRows(), [
        { kind: "podium", referenceDate: DATE_1, hasPublishedAt: true },
    ]);

    await markMessagePublished("absences", DATE_2);

    expectEqual("each kind and date has its own row", await readRows(), [
        { kind: "absences", referenceDate: DATE_2, hasPublishedAt: true },
        { kind: "podium", referenceDate: DATE_1, hasPublishedAt: true },
    ]);

    await cleanup();
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
