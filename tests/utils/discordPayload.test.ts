import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildMessagePayload } from "../../src/utils/discordPayload";

describe("buildMessagePayload", () => {
    it("keeps the content and forbids every mention", () => {
        assert.deepEqual(buildMessagePayload("hello"), {
            content: "hello",
            allowed_mentions: { parse: [] },
        });
    });

    it("does not alter a message that contains mentions", () => {
        const message = "@everyone @here <@&123456789012345678>";

        assert.equal(buildMessagePayload(message).content, message);
    });

    it("serializes to the JSON Discord expects", () => {
        assert.equal(
            JSON.stringify(buildMessagePayload("x")),
            '{"content":"x","allowed_mentions":{"parse":[]}}',
        );
    });

    it("does not share state between two payloads", () => {
        const first = buildMessagePayload("a");

        first.allowed_mentions.parse.push("everyone");

        assert.deepEqual(buildMessagePayload("b").allowed_mentions.parse, []);
    });
});
