import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isFreezeOverdue } from "../../rules/freezeGuard";

describe("isFreezeOverdue", () => {
    it("is false when no war is open", () => {
        assert.equal(isFreezeOverdue(null, "2026-11-02"), false);
    });

    it("is false while the open war can still be running", () => {
        assert.equal(isFreezeOverdue("2026-10-29", "2026-10-30"), false);
        assert.equal(isFreezeOverdue("2026-10-29", "2026-11-01"), false);
    });

    it("is true on the day the open war reaches its full length", () => {
        assert.equal(isFreezeOverdue("2026-10-29", "2026-11-02"), true);
    });

    it("stays true on later days", () => {
        assert.equal(isFreezeOverdue("2026-10-29", "2026-11-03"), true);
    });
});
