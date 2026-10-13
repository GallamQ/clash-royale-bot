import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { WarResult } from "../../rules/warResults";
import type { JokerState, WarHistoryEntry } from "../../rules/jokers";
import { replayJokers } from "../../rules/jokers";

const WAR_DATES = [
    "2026-10-08",
    "2026-10-15",
    "2026-10-22",
    "2026-10-29",
    "2026-11-05",
    "2026-11-12",
    "2026-11-19",
    "2026-11-26",
];

function result(tag: string, fame: number, role: string, exempt: boolean = false): WarResult {
    return { tag, fame, exempt, role };
}

function history(
    tag: string,
    role: string,
    fames: number[],
    exemptIndexes: number[] = [],
): WarHistoryEntry[] {
    return fames.map((fame, index) => ({
        startDate: WAR_DATES[index],
        results: [result(tag, fame, role, exemptIndexes.includes(index))],
    }));
}

function rivals(): WarResult[] {
    return [result("#X", 900, "leader"), result("#Y", 800, "leader"), result("#Z", 700, "leader")];
}

function historyBehindRivals(tag: string, role: string, fames: number[]): WarHistoryEntry[] {
    return fames.map((fame, index) => ({
        startDate: WAR_DATES[index],
        results: [result(tag, fame, role), ...rivals()],
    }));
}

function roleHistory(tag: string, steps: { role: string; fame: number }[]): WarHistoryEntry[] {
    return steps.map((step, index) => ({
        startDate: WAR_DATES[index],
        results: [result(tag, step.fame, step.role)],
    }));
}

function stateOf(wars: WarHistoryEntry[], tag: string = "#A"): JokerState {
    const state = replayJokers(wars).get(tag);

    if (!state) {
        throw new Error(`No state for ${tag}.`);
    }

    return state;
}

describe("replayJokers with zero points", () => {
    it("uses a joker when a member scores zero", () => {
        const state = stateOf(history("#A", "member", [0]));

        assert.deepEqual(state, { role: "member", jokers: 2, streak: 0, outcome: "jokerUsed" });
    });

    it("kicks a member who scores zero without any joker left", () => {
        const state = stateOf(history("#A", "member", [0, 0, 0, 0]));

        assert.deepEqual(state, { role: "member", jokers: 0, streak: 0, outcome: "kick" });
    });

    it("uses the only joker of an elder on a first zero", () => {
        const state = stateOf(history("#A", "elder", [0]));

        assert.deepEqual(state, { role: "elder", jokers: 0, streak: 0, outcome: "jokerUsed" });
    });

    it("demotes an elder who scores zero without any joker left", () => {
        const state = stateOf(history("#A", "elder", [0, 0]));

        assert.deepEqual(state, { role: "elder", jokers: 0, streak: 0, outcome: "demote" });
    });

    it("ignores leaders and co-leaders even with zero points", () => {
        const wars = [
            {
                startDate: WAR_DATES[0],
                results: [result("#L", 0, "leader"), result("#C", 0, "coLeader")],
            },
        ];

        assert.deepEqual(stateOf(wars, "#L"), {
            role: "leader",
            jokers: 0,
            streak: 0,
            outcome: "notConcerned",
        });
        assert.deepEqual(stateOf(wars, "#C"), {
            role: "coLeader",
            jokers: 0,
            streak: 0,
            outcome: "notConcerned",
        });
    });
});

describe("replayJokers with exempt wars", () => {
    it("does not use a joker when the war is exempt", () => {
        const state = stateOf(history("#A", "member", [0], [0]));

        assert.deepEqual(state, { role: "member", jokers: 3, streak: 0, outcome: "neutral" });
    });

    it("treats an exempt war as neutral even with points", () => {
        const state = stateOf(history("#A", "member", [100], [0]));

        assert.deepEqual(state, { role: "member", jokers: 3, streak: 0, outcome: "neutral" });
    });
});

describe("replayJokers with streaks", () => {
    it("counts a war with points in the streak", () => {
        const state = stateOf(history("#A", "member", [100]));

        assert.deepEqual(state, { role: "member", jokers: 3, streak: 1, outcome: "played" });
    });

    it("does not give a joker back before the fourth war with points", () => {
        const state = stateOf(history("#A", "member", [0, 100, 100, 100]));

        assert.deepEqual(state, { role: "member", jokers: 2, streak: 3, outcome: "played" });
    });

    it("gives a joker back after four wars in a row with points", () => {
        const state = stateOf(history("#A", "member", [0, 100, 100, 100, 100]));

        assert.deepEqual(state, { role: "member", jokers: 3, streak: 0, outcome: "played" });
    });

    it("keeps the streak through an exempt war", () => {
        const state = stateOf(history("#A", "member", [0, 100, 100, 100, 100, 100], [4]));

        assert.deepEqual(state, { role: "member", jokers: 3, streak: 0, outcome: "played" });
    });

    it("resets the streak after a zero", () => {
        const state = stateOf(history("#A", "member", [0, 100, 100, 100, 0, 100, 100, 100]));

        assert.deepEqual(state, { role: "member", jokers: 1, streak: 3, outcome: "played" });
    });

    it("never goes above the maximum number of jokers", () => {
        const state = stateOf(history("#A", "member", [100, 100, 100, 100]));

        assert.deepEqual(state, { role: "member", jokers: 3, streak: 0, outcome: "played" });
    });

    it("gives a joker back to a member who has none left", () => {
        const state = stateOf(history("#A", "member", [0, 0, 0, 100, 100, 100, 100]));

        assert.deepEqual(state, { role: "member", jokers: 1, streak: 0, outcome: "played" });
    });
});

describe("replayJokers with elders", () => {
    it("never gives a joker back to an elder through a streak", () => {
        const state = stateOf(historyBehindRivals("#A", "elder", [0, 100, 100, 100, 100]));

        assert.deepEqual(state, { role: "elder", jokers: 0, streak: 0, outcome: "played" });
    });

    it("gives the joker back to an elder who makes a top 3", () => {
        const state = stateOf(history("#A", "elder", [0, 500]));

        assert.deepEqual(state, { role: "elder", jokers: 1, streak: 0, outcome: "played" });
    });

    it("keeps a single joker for an elder who makes a top 3 with his joker", () => {
        const state = stateOf(history("#A", "elder", [500]));

        assert.deepEqual(state, { role: "elder", jokers: 1, streak: 0, outcome: "played" });
    });

    it("counts the third step as a top 3", () => {
        const wars = [
            { startDate: WAR_DATES[0], results: [result("#A", 0, "elder")] },
            {
                startDate: WAR_DATES[1],
                results: [
                    result("#A", 700, "elder"),
                    result("#B", 700, "member"),
                    result("#X", 900, "leader"),
                    result("#Y", 800, "leader"),
                ],
            },
        ];

        assert.deepEqual(stateOf(wars), {
            role: "elder",
            jokers: 1,
            streak: 0,
            outcome: "played",
        });
    });

    it("does not change anything for a member who makes a top 3", () => {
        const state = stateOf(history("#A", "member", [0, 500]));

        assert.deepEqual(state, { role: "member", jokers: 2, streak: 1, outcome: "played" });
    });
});

describe("replayJokers with role changes", () => {
    it("gives the allocation of an elder to a member promoted without any joker left", () => {
        const wars = roleHistory("#A", [
            { role: "member", fame: 0 },
            { role: "member", fame: 0 },
            { role: "member", fame: 0 },
            { role: "elder", fame: 0 },
        ]);

        assert.deepEqual(stateOf(wars), {
            role: "elder",
            jokers: 0,
            streak: 0,
            outcome: "jokerUsed",
        });
    });

    it("gives the allocation of a member to an elder who is demoted", () => {
        const wars = roleHistory("#A", [
            { role: "elder", fame: 0 },
            { role: "member", fame: 0 },
        ]);

        assert.deepEqual(stateOf(wars), {
            role: "member",
            jokers: 2,
            streak: 0,
            outcome: "jokerUsed",
        });
    });

    it("does not concern a member who becomes a co-leader", () => {
        const wars = roleHistory("#A", [
            { role: "member", fame: 0 },
            { role: "coLeader", fame: 0 },
        ]);

        assert.deepEqual(stateOf(wars), {
            role: "coLeader",
            jokers: 0,
            streak: 0,
            outcome: "notConcerned",
        });
    });

    it("starts again with all the jokers of a member who comes back from co-leader", () => {
        const wars = roleHistory("#A", [
            { role: "member", fame: 0 },
            { role: "coLeader", fame: 0 },
            { role: "member", fame: 0 },
        ]);

        assert.deepEqual(stateOf(wars), {
            role: "member",
            jokers: 2,
            streak: 0,
            outcome: "jokerUsed",
        });
    });
});

describe("replayJokers with the history", () => {
    it("returns nothing without any war", () => {
        assert.equal(replayJokers([]).size, 0);
    });

    it("starts at his first war for a member who appears later", () => {
        const wars = [
            { startDate: WAR_DATES[0], results: [result("#B", 100, "member")] },
            {
                startDate: WAR_DATES[1],
                results: [result("#A", 0, "member"), result("#B", 100, "member")],
            },
        ];

        assert.deepEqual(stateOf(wars), {
            role: "member",
            jokers: 2,
            streak: 0,
            outcome: "jokerUsed",
        });
    });

    it("forgets a member who is missing from the last war", () => {
        const wars = [
            {
                startDate: WAR_DATES[0],
                results: [result("#A", 0, "member"), result("#B", 100, "member")],
            },
            { startDate: WAR_DATES[1], results: [result("#B", 100, "member")] },
        ];

        assert.equal(replayJokers(wars).has("#A"), false);
        assert.equal(replayJokers(wars).has("#B"), true);
    });
});
