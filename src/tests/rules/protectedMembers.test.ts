import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { JokerState } from "../../rules/jokers";
import { parseProtectedTags, removeProtectedStates } from "../../rules/protectedMembers";

describe("parseProtectedTags", () => {
    it("returns an empty set when the variable is missing", () => {
        assert.deepEqual(parseProtectedTags(undefined), new Set());
    });

    it("returns an empty set when the variable is empty", () => {
        assert.deepEqual(parseProtectedTags(""), new Set());
    });

    it("reads several tags separated by commas", () => {
        assert.deepEqual(parseProtectedTags("#ABC,#DEF"), new Set(["#ABC", "#DEF"]));
    });

    it("removes the spaces around each tag", () => {
        assert.deepEqual(parseProtectedTags(" #ABC , #DEF "), new Set(["#ABC", "#DEF"]));
    });

    it("converts the tags to upper case", () => {
        assert.deepEqual(parseProtectedTags("#abc"), new Set(["#ABC"]));
    });

    it("ignores empty items", () => {
        assert.deepEqual(parseProtectedTags("#ABC,,"), new Set(["#ABC"]));
    });
});

describe("removeProtectedStates", () => {
    const kickState: JokerState = { role: "member", jokers: 0, streak: 0, outcome: "kick" };
    const playedState: JokerState = { role: "member", jokers: 3, streak: 2, outcome: "played" };
    const states = new Map<string, JokerState>([
        ["#AAA", kickState],
        ["#BBB", playedState],
        ["#CCC", kickState],
    ]);

    it("removes the protected players", () => {
        const result = removeProtectedStates(states, new Set(["#AAA"]));

        assert.deepEqual([...result.keys()], ["#BBB", "#CCC"]);
    });

    it("keeps the state of the other players unchanged", () => {
        const result = removeProtectedStates(states, new Set(["#AAA"]));

        assert.equal(result.get("#BBB"), playedState);
    });

    it("keeps everyone when nobody is protected", () => {
        const result = removeProtectedStates(states, new Set());

        assert.deepEqual([...result.keys()], ["#AAA", "#BBB", "#CCC"]);
    });

    it("ignores a protected tag that is not in the states", () => {
        const result = removeProtectedStates(states, new Set(["#ZZZ"]));

        assert.deepEqual([...result.keys()], ["#AAA", "#BBB", "#CCC"]);
    });

    it("does not modify the original map", () => {
        removeProtectedStates(states, new Set(["#AAA"]));

        assert.equal(states.size, 3);
    });
});
