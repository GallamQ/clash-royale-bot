import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getClanEndpoint, normalizeClanTag } from "../../utils/clanTag";

describe("normalizeClanTag", () => {
    it("adds the # when it is missing", () => {
        assert.equal(normalizeClanTag("ABC123"), "#ABC123");
    });

    it("keeps a single # when it is already there", () => {
        assert.equal(normalizeClanTag("#ABC123"), "#ABC123");
    });

    it("ignores surrounding whitespace", () => {
        assert.equal(normalizeClanTag(" ABC123\r\n"), "#ABC123");
    });
});

describe("getClanEndpoint", () => {
    it("encodes the # as %23", () => {
        assert.equal(getClanEndpoint("#ABC123"), "clans/%23ABC123");
    });

    it("gives the same endpoint with or without # in the environment variable", () => {
        assert.equal(getClanEndpoint(normalizeClanTag("ABC123")), "clans/%23ABC123");
        assert.equal(getClanEndpoint(normalizeClanTag("#ABC123")), "clans/%23ABC123");
    });
});
