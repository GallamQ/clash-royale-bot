import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ClanMember } from "../../types/db";
import type { JokerOutcome, JokerState } from "../../rules/jokers";
import { buildJokerLossList } from "../../rules/jokerLosses";

function member(tag: string, name: string, role: string): ClanMember {
    return { tag, name, role, joinDate: "2026-01-01" };
}

function state(outcome: JokerOutcome, jokers: number = 0, role: string = "member"): JokerState {
    return { role, jokers, streak: 0, outcome };
}

function run(roster: ClanMember[], states: [string, JokerState][]) {
    const membersByTag = new Map(roster.map((m) => [m.tag, m]));
    const losses = buildJokerLossList(new Map(states), membersByTag);

    return losses.map((loss) => ({ name: loss.member.name, jokersLeft: loss.jokersLeft }));
}

describe("buildJokerLossList", () => {
    it("lists a player who used a joker with the jokers he has left", () => {
        const roster = [member("#A", "Alice", "member")];
        const losses = run(roster, [["#A", state("jokerUsed", 2)]]);

        assert.deepEqual(losses, [{ name: "Alice", jokersLeft: 2 }]);
    });

    it("lists a player who used his last joker with zero jokers left", () => {
        const roster = [member("#B", "Bob", "elder")];
        const losses = run(roster, [["#B", state("jokerUsed", 0, "elder")]]);

        assert.deepEqual(losses, [{ name: "Bob", jokersLeft: 0 }]);
    });

    it("lists several players in the order of the states", () => {
        const roster = [member("#A", "Alice", "member"), member("#B", "Bob", "member")];
        const losses = run(roster, [
            ["#B", state("jokerUsed", 1)],
            ["#A", state("jokerUsed", 2)],
        ]);

        assert.deepEqual(losses, [
            { name: "Bob", jokersLeft: 1 },
            { name: "Alice", jokersLeft: 2 },
        ]);
    });

    it("ignores every outcome other than a joker used", () => {
        const roster = [
            member("#A", "Alice", "member"),
            member("#B", "Bob", "member"),
            member("#C", "Chloé", "member"),
            member("#D", "David", "elder"),
            member("#E", "Émilie", "leader"),
        ];
        const losses = run(roster, [
            ["#A", state("played", 3)],
            ["#B", state("neutral", 3)],
            ["#C", state("kick")],
            ["#D", state("demote", 0, "elder")],
            ["#E", state("notConcerned", 0, "leader")],
        ]);

        assert.deepEqual(losses, []);
    });

    it("ignores players who are no longer in the roster", () => {
        const roster = [member("#A", "Alice", "member")];
        const losses = run(roster, [
            ["#A", state("jokerUsed", 2)],
            ["#Z", state("jokerUsed", 1)],
        ]);

        assert.deepEqual(losses, [{ name: "Alice", jokersLeft: 2 }]);
    });

    it("returns an empty list without states", () => {
        const roster = [member("#A", "Alice", "member")];

        assert.deepEqual(run(roster, []), []);
    });
});
