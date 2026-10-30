import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getWebhookEnvName } from "../../utils/webhookChannel";

describe("getWebhookEnvName", () => {
    it("uses the dedicated variable of each channel when it is defined", () => {
        const env = {
            PODIUM_WEBHOOK_URL: "https://example.com/podium",
            KICK_LIST_WEBHOOK_URL: "https://example.com/kick",
            JOKER_LOSSES_WEBHOOK_URL: "https://example.com/jokers",
            ABSENCES_WEBHOOK_URL: "https://example.com/absences",
        };

        assert.equal(getWebhookEnvName("podium", env), "PODIUM_WEBHOOK_URL");
        assert.equal(getWebhookEnvName("kickList", env), "KICK_LIST_WEBHOOK_URL");
        assert.equal(getWebhookEnvName("jokerLosses", env), "JOKER_LOSSES_WEBHOOK_URL");
        assert.equal(getWebhookEnvName("absences", env), "ABSENCES_WEBHOOK_URL");
    });

    it("falls back to DISCORD_WEBHOOK_URL when the dedicated variable is missing", () => {
        assert.equal(getWebhookEnvName("podium", {}), "DISCORD_WEBHOOK_URL");
    });

    it("falls back when the dedicated variable is empty", () => {
        const env = { KICK_LIST_WEBHOOK_URL: "" };

        assert.equal(getWebhookEnvName("kickList", env), "DISCORD_WEBHOOK_URL");
    });

    it("ignores the variables of the other channels", () => {
        const env = { PODIUM_WEBHOOK_URL: "https://example.com/podium" };

        assert.equal(getWebhookEnvName("kickList", env), "DISCORD_WEBHOOK_URL");
    });
});
