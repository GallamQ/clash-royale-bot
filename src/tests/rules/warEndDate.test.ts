import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { PeriodLog } from "../../types/api";
import { getWarEndDate } from "../../rules/warEndDate";

const OUR_CLAN = "#OURCLAN";
const OTHER_CLAN = "#OTHER";
const WAR_START = "2026-10-08";
const START_INDEX = 3;

function day(periodIndex: number, ...clans: [string, number][]): PeriodLog {
    return {
        periodIndex,
        items: clans.map(([tag, progressEndOfDay]) => ({
            clan: { tag },
            pointsEarned: 0,
            progressStartOfDay: 0,
            progressEndOfDay,
            endOfDayRank: 1,
        })),
    };
}

function run(periodLogs: PeriodLog[], periodType: string = "warDay") {
    return getWarEndDate(WAR_START, START_INDEX, periodLogs, OUR_CLAN, periodType);
}

describe("getWarEndDate", () => {
    it("ends after four days when the finish line is never reached", () => {
        const logs = [day(3, [OUR_CLAN, 2000]), day(4, [OUR_CLAN, 4000]), day(5, [OUR_CLAN, 6000])];

        assert.equal(run(logs), "2026-10-12");
    });

    it("ends after four days without any period log", () => {
        assert.equal(run([]), "2026-10-12");
    });

    it("ends after three days when the finish line is reached on the third day", () => {
        const logs = [
            day(3, [OUR_CLAN, 3000]),
            day(4, [OUR_CLAN, 6000]),
            day(5, [OUR_CLAN, 10200]),
        ];

        assert.equal(run(logs), "2026-10-11");
    });

    it("ends after one day when the finish line is reached on the first day", () => {
        assert.equal(run([day(3, [OUR_CLAN, 10500])]), "2026-10-09");
    });

    it("counts exactly 10000 points as reaching the finish line", () => {
        const logs = [day(3, [OUR_CLAN, 4000]), day(4, [OUR_CLAN, 10000])];

        assert.equal(run(logs), "2026-10-10");
    });

    it("ends after four days when the finish line is reached on the fourth day", () => {
        const logs = [day(5, [OUR_CLAN, 7000]), day(6, [OUR_CLAN, 10100])];

        assert.equal(run(logs), "2026-10-12");
    });

    it("ignores other clans reaching the finish line", () => {
        const logs = [day(5, [OTHER_CLAN, 12000], [OUR_CLAN, 4000])];

        assert.equal(run(logs), "2026-10-12");
    });

    it("ignores the days of a previous war", () => {
        const logs = [day(5, [OUR_CLAN, 10200]), day(10, [OUR_CLAN, 3000])];

        assert.equal(getWarEndDate("2026-10-15", 10, logs, OUR_CLAN, "warDay"), "2026-10-19");
    });

    it("always ends after four days during a colosseum", () => {
        const logs = [day(5, [OUR_CLAN, 20000])];

        assert.equal(run(logs, "colosseum"), "2026-10-12");
    });

    it("uses the earliest day even when the period logs are not sorted", () => {
        const logs = [day(5, [OUR_CLAN, 10200]), day(4, [OUR_CLAN, 10100])];

        assert.equal(run(logs), "2026-10-10");
    });
});
