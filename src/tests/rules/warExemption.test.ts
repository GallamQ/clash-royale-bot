import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isWarExempt } from "../../rules/warExemption";

const WAR_START = "2026-10-08";
const LONG_AGO = "2026-01-01";

function absence(startDate: string, endDate: string) {
    return { startDate, endDate };
}

describe("isWarExempt", () => {
    it("is not exempt without absence for a member who joined long ago", () => {
        assert.equal(isWarExempt(WAR_START, LONG_AGO, []), false);
    });

    it("is exempt for a member who joined on the first day of the war", () => {
        assert.equal(isWarExempt(WAR_START, "2026-10-08", []), true);
    });

    it("is exempt for a member who joined during the war", () => {
        assert.equal(isWarExempt(WAR_START, "2026-10-10", []), true);
    });

    it("is not exempt for a member who joined the day before the war", () => {
        assert.equal(isWarExempt(WAR_START, "2026-10-07", []), false);
    });

    it("is exempt with an absence inside the week", () => {
        assert.equal(isWarExempt(WAR_START, LONG_AGO, [absence("2026-10-06", "2026-10-07")]), true);
    });

    it("is exempt with an absence covering the whole week", () => {
        assert.equal(isWarExempt(WAR_START, LONG_AGO, [absence("2026-10-05", "2026-10-11")]), true);
    });

    it("is exempt with a one-day absence on the Monday of the week", () => {
        assert.equal(isWarExempt(WAR_START, LONG_AGO, [absence("2026-10-05", "2026-10-05")]), true);
    });

    it("is exempt with an absence starting on the Sunday of the week", () => {
        assert.equal(isWarExempt(WAR_START, LONG_AGO, [absence("2026-10-11", "2026-10-13")]), true);
    });

    it("is exempt with an absence of the previous week that ends on the Monday", () => {
        assert.equal(isWarExempt(WAR_START, LONG_AGO, [absence("2026-10-02", "2026-10-05")]), true);
    });

    it("is not exempt with an absence that ended on the previous Sunday", () => {
        assert.equal(
            isWarExempt(WAR_START, LONG_AGO, [absence("2026-09-28", "2026-10-04")]),
            false,
        );
    });

    it("is not exempt with an absence starting on the next Monday", () => {
        assert.equal(
            isWarExempt(WAR_START, LONG_AGO, [absence("2026-10-12", "2026-10-14")]),
            false,
        );
    });

    it("is exempt when only one of several absences touches the week", () => {
        const absences = [absence("2026-09-01", "2026-09-07"), absence("2026-10-09", "2026-10-09")];

        assert.equal(isWarExempt(WAR_START, LONG_AGO, absences), true);
    });

    it("uses the week of a war that starts at the end of a month", () => {
        assert.equal(
            isWarExempt("2026-10-29", LONG_AGO, [absence("2026-11-01", "2026-11-03")]),
            true,
        );
        assert.equal(
            isWarExempt("2026-10-29", LONG_AGO, [absence("2026-11-02", "2026-11-03")]),
            false,
        );
    });
});
