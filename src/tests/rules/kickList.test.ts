import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ClanMember } from "../../types/db";
import type { JokerOutcome, JokerState } from "../../rules/jokers";
import { buildKickList } from "../../rules/kickList";

function member(tag: string, name: string, role: string): ClanMember {
    return { tag, name, role, joinDate: "2026-01-01" };
}

function state(outcome: JokerOutcome, role: string = "member"): JokerState {
    return { role, jokers: 0, streak: 0, outcome };
}

function run(roster: ClanMember[], states: [string, JokerState][]) {
    const membersByTag = new Map(roster.map((m) => [m.tag, m]));
    const list = buildKickList(new Map(states), membersByTag);

    return {
        toKick: list.toKick.map((m) => m.name),
        toDemote: list.toDemote.map((m) => m.name),
    };
}

describe("buildKickList", () => {
    it("kicks a member and demotes an elder when the engine says so", () => {
        const roster = [member("#A", "Alice", "member"), member("#B", "Bob", "elder")];
        const list = run(roster, [
            ["#A", state("kick", "member")],
            ["#B", state("demote", "elder")],
        ]);

        assert.deepEqual(list, { toKick: ["Alice"], toDemote: ["Bob"] });
    });

    it("ignores members and elders who used a joker", () => {
        const roster = [member("#A", "Alice", "member"), member("#B", "Bob", "elder")];
        const list = run(roster, [
            ["#A", state("jokerUsed", "member")],
            ["#B", state("jokerUsed", "elder")],
        ]);

        assert.deepEqual(list, { toKick: [], toDemote: [] });
    });

    it("ignores players who played, were neutral or are not concerned", () => {
        const roster = [
            member("#A", "Alice", "member"),
            member("#F", "Fred", "member"),
            member("#E", "Émilie", "leader"),
        ];
        const list = run(roster, [
            ["#A", state("played")],
            ["#F", state("neutral")],
            ["#E", state("notConcerned", "leader")],
        ]);

        assert.deepEqual(list, { toKick: [], toDemote: [] });
    });

    it("ignores players who are no longer in the roster", () => {
        const roster = [member("#A", "Alice", "member")];
        const list = run(roster, [["#X", state("kick")]]);

        assert.deepEqual(list, { toKick: [], toDemote: [] });
    });

    it("ignores roster members who have no state", () => {
        const roster = [member("#A", "Alice", "member"), member("#N", "Nina", "member")];
        const list = run(roster, [["#A", state("kick")]]);

        assert.deepEqual(list, { toKick: ["Alice"], toDemote: [] });
    });

    it("uses the outcome, not the current role", () => {
        const roster = [member("#B", "Bob", "member"), member("#C", "Chloé", "elder")];
        const list = run(roster, [
            ["#B", state("demote", "elder")],
            ["#C", state("kick", "member")],
        ]);

        assert.deepEqual(list, { toKick: ["Chloé"], toDemote: ["Bob"] });
    });

    it("returns empty lists without states", () => {
        const roster = [member("#A", "Alice", "member")];

        assert.deepEqual(run(roster, []), { toKick: [], toDemote: [] });
    });
});
