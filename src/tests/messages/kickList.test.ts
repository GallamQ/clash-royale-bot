import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatKickList } from "../../messages/kickList";
import type { ClanMember } from "../../types/db";
import { safeName } from "../../utils/safeName";

function member(name: string, role: string): ClanMember {
    return { tag: `#${name}`, name, role, join_date: "2026-01-01" };
}

describe("formatKickList", () => {
    it("congratulates everybody when nobody is listed", () => {
        const message = formatKickList({ toKick: [], toDemote: [] });

        assert.ok(message.includes("Tous les joueurs ont marqué des points"));
        assert.ok(!message.includes("KICKER"));
    });

    it("lists only the players to kick", () => {
        const message = formatKickList({ toKick: [member("Alice", "member")], toDemote: [] });

        assert.ok(message.includes("À KICKER (1)"));
        assert.ok(message.includes(`❌ ${safeName("Alice")}`));
        assert.ok(!message.includes("RÉTROGRADER"));
    });

    it("lists only the players to demote", () => {
        const message = formatKickList({ toKick: [], toDemote: [member("Bob", "elder")] });

        assert.ok(message.includes("À RÉTROGRADER (Aîné → Membre) (1)"));
        assert.ok(message.includes(safeName("Bob")));
        assert.ok(!message.includes("KICKER"));
    });

    it("lists both groups with the players to kick first", () => {
        const message = formatKickList({
            toKick: [member("Alice", "member"), member("Chloé", "member")],
            toDemote: [member("Bob", "elder")],
        });

        assert.ok(message.includes("À KICKER (2)"));
        assert.ok(message.includes("À RÉTROGRADER (Aîné → Membre) (1)"));
        assert.ok(message.indexOf("KICKER") < message.indexOf("RÉTROGRADER"));
    });
});
