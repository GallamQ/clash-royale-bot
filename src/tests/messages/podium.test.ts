import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatPodium } from "../../messages/podium";
import type { PodiumStep } from "../../rules/podium";
import type { ClanMember } from "../../types/db";
import { safeName } from "../../utils/safeName";

function member(name: string, role: string): ClanMember {
    return { tag: `#${name}`, name, role, joinDate: "2026-01-01" };
}

describe("formatPodium", () => {
    it("shows the war id and the steps in order", () => {
        const podium: PodiumStep[] = [
            { place: 1, fame: 900, players: [member("Alice", "member")] },
            { place: 2, fame: 800, players: [member("Bob", "elder")] },
        ];
        const message = formatPodium("24", podium);

        assert.ok(message.includes("24"));
        assert.ok(message.indexOf(":first_place:") < message.indexOf(":second_place:"));
    });

    it("announces a promotion for a member", () => {
        const podium: PodiumStep[] = [
            { place: 1, fame: 900, players: [member("Alice", "member")] },
        ];
        const message = formatPodium("24", podium);

        assert.ok(message.includes(safeName("Alice")));
        assert.ok(message.includes("900 points"));
        assert.ok(message.includes("Membre"));
        assert.ok(message.includes("Promotion"));
    });

    it("does not announce a promotion for an elder", () => {
        const podium: PodiumStep[] = [{ place: 1, fame: 900, players: [member("Bob", "elder")] }];
        const message = formatPodium("24", podium);

        assert.ok(message.includes("Aîné"));
        assert.ok(!message.includes("Promotion"));
    });

    it("groups tied players under one step", () => {
        const podium: PodiumStep[] = [
            {
                place: 1,
                fame: 900,
                players: [member("Alice", "member"), member("Bob", "elder")],
            },
        ];
        const message = formatPodium("24", podium);

        assert.ok(message.includes("Égalité (2 joueurs)"));
        assert.ok(message.includes(safeName("Alice")));
        assert.ok(message.includes(safeName("Bob")));
    });

    it("falls back to an unknown label for an unexpected role", () => {
        const podium: PodiumStep[] = [{ place: 1, fame: 900, players: [member("Alice", "king")] }];
        const message = formatPodium("24", podium);

        assert.ok(message.includes("Inconnu"));
    });

    it("translates every known role", () => {
        const labels = {
            member: "Membre",
            elder: "Aîné",
            coLeader: "Chef adjoint",
            leader: "Chef",
        };

        for (const [role, label] of Object.entries(labels)) {
            const podium: PodiumStep[] = [
                { place: 1, fame: 900, players: [member("Alice", role)] },
            ];

            assert.ok(formatPodium("24", podium).includes(label));
        }
    });
});
