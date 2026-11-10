import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseProtectedTags } from "../../rules/protectedMembers";

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
