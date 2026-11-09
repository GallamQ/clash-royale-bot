import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { splitMessage } from "../../utils/splitMessage";

describe("splitMessage", () => {
    it("returns the message unchanged when it fits", () => {
        assert.deepEqual(splitMessage("a\nb", 10), ["a\nb"]);
    });

    it("accepts a message of exactly the maximum length", () => {
        assert.deepEqual(splitMessage("ab\ncd", 5), ["ab\ncd"]);
    });

    it("splits at line breaks when the message is too long", () => {
        assert.deepEqual(splitMessage("aaa\nbbb\nccc", 7), ["aaa\nbbb", "ccc"]);
        assert.deepEqual(splitMessage("aaa\nbbb\nccc", 6), ["aaa", "bbb", "ccc"]);
    });

    it("keeps blank lines inside a chunk", () => {
        assert.deepEqual(splitMessage("a\n\nb", 10), ["a\n\nb"]);
    });

    it("never exceeds the maximum length and loses nothing", () => {
        const message = Array.from({ length: 100 }, (_, index) => `line ${index}`).join("\n");
        const chunks = splitMessage(message, 50);

        for (const chunk of chunks) {
            assert.ok(chunk.length <= 50);
        }

        assert.equal(chunks.join("\n"), message);
    });

    it("throws when a single line is longer than the maximum", () => {
        assert.throws(() => splitMessage("abcdef", 5));
    });
});
