import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { PeriodLog } from "../../types/api";
import { getWarStartIndex, hasWarEnded } from "../../rules/warStatus";

const OUR_CLAN = "#OURCLAN";
const OTHER_CLAN = "#OTHER";

function day(periodIndex: number, clanTag: string, progressEndOfDay: number): PeriodLog {
    return {
        periodIndex,
        items: [
            {
                clan: { tag: clanTag },
                pointsEarned: 0,
                progressStartOfDay: 0,
                progressEndOfDay,
                endOfDayRank: 1,
            },
        ],
    };
}

describe("getWarStartIndex", () => {
    it("returns the index itself on the first war day", () => {
        assert.equal(getWarStartIndex(3), 3);
        assert.equal(getWarStartIndex(24), 24);
    });

    it("gives the same id on the four war days", () => {
        for (const periodIndex of [3, 4, 5, 6]) {
            assert.equal(getWarStartIndex(periodIndex), 3);
        }
    });

    it("keeps the same id on the training days after the war", () => {
        for (const periodIndex of [7, 8, 9]) {
            assert.equal(getWarStartIndex(periodIndex), 3);
        }
    });

    it("starts a new id on the next war", () => {
        assert.equal(getWarStartIndex(10), 10);
        assert.equal(getWarStartIndex(13), 10);
    });
});

describe("hasWarEnded", () => {
    it("returns false when there is no log", () => {
        assert.equal(hasWarEnded([], OUR_CLAN, 24, "warDay"), false);
    });

    it("returns false when our clan is under 10000 points", () => {
        const logs = [day(24, OUR_CLAN, 9999)];

        assert.equal(hasWarEnded(logs, OUR_CLAN, 24, "warDay"), false);
    });

    it("returns true when our clan reaches exactly 10000 points", () => {
        const logs = [day(24, OUR_CLAN, 10000)];

        assert.equal(hasWarEnded(logs, OUR_CLAN, 24, "warDay"), true);
    });

    it("ignores logs from previous wars", () => {
        const logs = [day(5, OUR_CLAN, 10000), day(12, OUR_CLAN, 10000), day(19, OUR_CLAN, 10000)];

        assert.equal(hasWarEnded(logs, OUR_CLAN, 24, "warDay"), false);
    });

    it("ignores other clans reaching 10000 points", () => {
        const logs = [day(24, OTHER_CLAN, 10000)];

        assert.equal(hasWarEnded(logs, OUR_CLAN, 24, "warDay"), false);
    });

    it("never ends during a colosseum", () => {
        const logs = [day(24, OUR_CLAN, 10000)];

        assert.equal(hasWarEnded(logs, OUR_CLAN, 24, "colosseum"), false);
    });
});
