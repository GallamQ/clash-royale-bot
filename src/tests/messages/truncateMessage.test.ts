import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { truncateMessage } from "../../messages/truncateMessage";

describe("truncateMessage", () => {
    it("returns the message unchanged when it fits", () => {
        assert.equal(truncateMessage("a\nb\n", 10), "a\nb\n");
    });

    it("accepts a message of exactly the maximum length", () => {
        assert.equal(truncateMessage("abcde", 5), "abcde");
    });

    it("removes the last lines and says how many are hidden", () => {
        const message =
            ["Titre", "", "a".repeat(10), "b".repeat(10), "c".repeat(10), "d".repeat(10)].join(
                "\n",
            ) + "\n";
        const expected = ["Titre", "", "a".repeat(10), "b".repeat(10), "… et 2 autres"].join("\n");

        assert.equal(truncateMessage(message, 45), expected);
    });

    it("uses the singular when only one line is hidden", () => {
        const message =
            ["Titre", "", "a".repeat(10), "b".repeat(10), "c".repeat(20)].join("\n") + "\n";
        const expected = ["Titre", "", "a".repeat(10), "b".repeat(10), "… et 1 autre"].join("\n");

        assert.equal(truncateMessage(message, 45), expected);
    });

    it("stops when no line is left to hide", () => {
        const result = truncateMessage("a".repeat(10) + "\n" + "b".repeat(10), 5);

        assert.ok(result.endsWith("… et 2 autres"));
    });

    it("never exceeds the maximum length and counts the hidden lines", () => {
        const absences = Array.from(
            { length: 100 },
            (_, index) => `• Joueur ${index} - Du 05-10-2026 au 11-10-2026`,
        );
        const message = `Confirmation\n\nTitre\n\n${absences.join("\n")}\n`;
        const result = truncateMessage(message, 1000);
        const visible = result.split("\n").filter((line) => line.startsWith("•")).length;

        assert.ok(result.length <= 1000);
        assert.ok(visible < 100);
        assert.ok(result.endsWith(`… et ${100 - visible} autres`));
    });
});
