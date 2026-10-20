import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DEPARTED_MEMBER_RETENTION_DAYS, getPurgeCutoffDate } from "../../rules/departedMembers";

describe("getPurgeCutoffDate", () => {
    it("keeps departed members for 90 days", () => {
        assert.equal(DEPARTED_MEMBER_RETENTION_DAYS, 90);
    });

    it("returns the date 90 days before today", () => {
        assert.equal(getPurgeCutoffDate("2026-10-20"), "2026-07-22");
    });

    it("crosses a year boundary", () => {
        assert.equal(getPurgeCutoffDate("2027-01-15"), "2026-10-17");
    });

    it("handles a leap year", () => {
        assert.equal(getPurgeCutoffDate("2028-03-01"), "2027-12-02");
    });
});
