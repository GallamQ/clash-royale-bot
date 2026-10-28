import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatJokerLosses } from "../../messages/jokerLosses";
import type { JokerLoss } from "../../rules/jokerLosses";
import { safeName } from "../../utils/safeName";

function loss(name: string, jokersLeft: number, role: string = "member"): JokerLoss {
    return {
        member: { tag: `#${name}`, name, role, joinDate: "2026-01-01" },
        jokersLeft,
    };
}

describe("formatJokerLosses", () => {
    it("says that no joker was lost when the list is empty", () => {
        assert.equal(formatJokerLosses([]), "✅ Aucun joker perdu cette semaine !");
    });

    it("groups the players by jokers left, starting with those who have none", () => {
        const message = formatJokerLosses([
            loss("Alice", 2),
            loss("David", 0, "elder"),
            loss("Bob", 2),
            loss("Chloé", 1),
            loss("Émilie", 0),
        ]);

        const expected =
            "**Suivi des jokers 🃏**\n\n" +
            "**Plus aucun joker** (prochain zéro = sanction)\n" +
            `⚠️ ${safeName("David")}\n` +
            `⚠️ ${safeName("Émilie")}\n\n` +
            "**1 joker restant**\n" +
            `🃏 ${safeName("Chloé")}\n\n` +
            "**2 jokers restants**\n" +
            `🃏 ${safeName("Alice")}\n` +
            `🃏 ${safeName("Bob")}\n`;

        assert.equal(message, expected);
    });

    it("omits the groups nobody belongs to", () => {
        const message = formatJokerLosses([loss("Alice", 2)]);

        assert.equal(
            message,
            `**Suivi des jokers 🃏**\n\n**2 jokers restants**\n🃏 ${safeName("Alice")}\n`,
        );
    });

    it("warns about the players who have no joker left", () => {
        const message = formatJokerLosses([loss("Bob", 0, "elder")]);

        assert.equal(
            message,
            "**Suivi des jokers 🃏**\n\n" +
                "**Plus aucun joker** (prochain zéro = sanction)\n" +
                `⚠️ ${safeName("Bob")}\n`,
        );
    });

    it("keeps the given order inside a group", () => {
        const message = formatJokerLosses([loss("Zoé", 2), loss("Alice", 2)]);

        assert.ok(message.indexOf("Zoé") < message.indexOf("Alice"));
    });
});
