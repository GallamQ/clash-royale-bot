import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isRosterComplete } from "../../rules/rosterCompleteness";

describe("isRosterComplete", () => {
    it("accepts a list with as many members as announced", () => {
        assert.equal(isRosterComplete(50, 50), true);
    });

    it("rejects a list with fewer members than announced", () => {
        assert.equal(isRosterComplete(50, 48), false);
    });

    it("rejects a list with more members than announced", () => {
        assert.equal(isRosterComplete(48, 50), false);
    });

    it("rejects an empty list for a clan that has members", () => {
        assert.equal(isRosterComplete(50, 0), false);
    });
});
