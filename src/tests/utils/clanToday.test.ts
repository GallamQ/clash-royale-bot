import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getClanToday } from "../../utils/clanToday";

describe("getClanToday", () => {
    it("returns the same day at midday", () => {
        assert.equal(getClanToday(new Date("2026-10-05T10:00:00Z")), "2026-10-05");
    });

    it("is still the previous day one minute before midnight in summer", () => {
        assert.equal(getClanToday(new Date("2026-10-04T21:59:00Z")), "2026-10-04");
    });

    it("is the next day at midnight in summer", () => {
        assert.equal(getClanToday(new Date("2026-10-04T22:00:00Z")), "2026-10-05");
    });

    it("keeps the last day of summer time until 23:00 UTC", () => {
        assert.equal(getClanToday(new Date("2026-10-25T22:59:00Z")), "2026-10-25");
    });

    it("changes day at 23:00 UTC in winter", () => {
        assert.equal(getClanToday(new Date("2026-10-25T23:00:00Z")), "2026-10-26");
    });

    it("crosses a year boundary", () => {
        assert.equal(getClanToday(new Date("2026-12-31T23:00:00Z")), "2027-01-01");
    });
});
