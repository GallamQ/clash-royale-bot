import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addDays } from "../../utils/addDays";

describe("addDays", () => {
    it("adds days inside a month", () => {
        assert.equal(addDays("2026-10-08", 3), "2026-10-11");
    });

    it("subtracts days with a negative number", () => {
        assert.equal(addDays("2026-10-08", -3), "2026-10-05");
    });

    it("returns the same date for zero days", () => {
        assert.equal(addDays("2026-10-08", 0), "2026-10-08");
    });

    it("crosses a month boundary", () => {
        assert.equal(addDays("2026-10-29", 4), "2026-11-02");
    });

    it("crosses a year boundary", () => {
        assert.equal(addDays("2026-12-30", 3), "2027-01-02");
    });
});
