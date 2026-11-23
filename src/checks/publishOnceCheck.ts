import { deepStrictEqual } from "node:assert/strict";
import { requireTestDatabase } from "./requireTestDatabase";
import { isMessagePublished } from "../db/publishedMessages";
import { pool } from "../db/pool";
import { publishOnce } from "../jobs/publishOnce";

const DATE_1 = "2090-03-02";
const DATE_2 = "2090-03-09";
const DATE_3 = "2090-03-16";
const DATE_4 = "2090-03-23";
const TEST_DATES = [DATE_1, DATE_2, DATE_3, DATE_4];

let failures = 0;
let sendCount = 0;

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

async function send() {
    sendCount += 1;
}

async function failingSend() {
    throw new Error("Send failed.");
}

async function cleanup() {
    await pool.query("DELETE FROM published_messages WHERE reference_date = ANY($1)", [TEST_DATES]);
}

async function countRows() {
    const result = await pool.query(
        "SELECT count(*)::int AS count FROM published_messages WHERE reference_date = ANY($1)",
        [TEST_DATES],
    );

    return result.rows[0].count;
}

async function main() {
    requireTestDatabase();

    delete process.env.DRY_RUN;

    await cleanup();

    expectEqual(
        "first call sends and returns true",
        await publishOnce("podium", DATE_1, send),
        true,
    );
    expectEqual("first call sent once", sendCount, 1);
    expectEqual("first call is recorded", await isMessagePublished("podium", DATE_1), true);

    expectEqual("second call returns false", await publishOnce("podium", DATE_1, send), false);
    expectEqual("second call does not send", sendCount, 1);

    expectEqual("another date sends", await publishOnce("podium", DATE_2, send), true);
    expectEqual(
        "another kind on the same date sends",
        await publishOnce("kickList", DATE_1, send),
        true,
    );
    expectEqual("three messages sent so far", sendCount, 3);

    await expectRejects("a failing send rejects", () => publishOnce("podium", DATE_3, failingSend));
    expectEqual(
        "a failing send is not recorded",
        await isMessagePublished("podium", DATE_3),
        false,
    );
    expectEqual(
        "a failed message can be sent again",
        await publishOnce("podium", DATE_3, send),
        true,
    );

    sendCount = 0;
    process.env.DRY_RUN = "1";

    expectEqual("dry run sends a new message", await publishOnce("podium", DATE_4, send), true);
    expectEqual("dry run does not record", await isMessagePublished("podium", DATE_4), false);
    expectEqual(
        "dry run sends an already published message",
        await publishOnce("podium", DATE_1, send),
        true,
    );
    expectEqual("dry run sent twice", sendCount, 2);

    delete process.env.DRY_RUN;

    expectEqual("four rows remain after the dry run", await countRows(), 4);

    await cleanup();
    await pool.end();

    if (failures > 0) {
        console.log(`${failures} check(s) failed.`);
        process.exit(1);
    }

    console.log("All checks passed.");
}

async function expectRejects(label: string, action: () => Promise<unknown>) {
    try {
        await action();
        failures += 1;
        console.log(`FAIL ${label}`);
    } catch {
        console.log(`OK   ${label}`);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
