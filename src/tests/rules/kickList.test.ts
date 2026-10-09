import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ClanMember, WarLogRow } from "../../types/db";
import { buildKickList } from "../../rules/kickList";

function member(tag: string, name: string, role: string): ClanMember {
    return { tag, name, role, joinDate: "2026-01-01" };
}

function log(tag: string | null, fame: number): WarLogRow {
    return { id: 0, war_id: "test", war_date: "2026-10-01", tag, fame };
}

function run(roster: ClanMember[], warLogs: WarLogRow[], absentTags: string[] = []) {
    const membersByTag = new Map(roster.map((m) => [m.tag, m]));
    const result = buildKickList(warLogs, membersByTag, new Set(absentTags));

    return {
        toKick: result.toKick.map((m) => m.name),
        toDemote: result.toDemote.map((m) => m.name),
    };
}

describe("buildKickList", () => {
    it("kicks a member and demotes an elder who scored zero", () => {
        const roster = [member("#A", "Alice", "member"), member("#B", "Bob", "elder")];
        const result = run(roster, [log("#A", 0), log("#B", 0)]);

        assert.deepEqual(result, { toKick: ["Alice"], toDemote: ["Bob"] });
    });

    it("ignores members who scored points", () => {
        const roster = [member("#A", "Alice", "member"), member("#B", "Bob", "elder")];
        const result = run(roster, [log("#A", 100), log("#B", 100)]);

        assert.deepEqual(result, { toKick: [], toDemote: [] });
    });

    it("ignores leaders and co-leaders even with zero points", () => {
        const roster = [member("#D", "David", "coLeader"), member("#E", "Émilie", "leader")];
        const result = run(roster, [log("#D", 0), log("#E", 0)]);

        assert.deepEqual(result, { toKick: [], toDemote: [] });
    });

    it("ignores absent members", () => {
        const roster = [member("#F", "Fred", "member")];
        const result = run(roster, [log("#F", 0)], ["#F"]);

        assert.deepEqual(result, { toKick: [], toDemote: [] });
    });

    it("ignores logs without a tag or with an unknown tag", () => {
        const roster = [member("#A", "Alice", "member")];
        const result = run(roster, [log("#A", 100), log(null, 0), log("#X", 0)]);

        assert.deepEqual(result, { toKick: [], toDemote: [] });
    });

    it("kicks a member who has no war log", () => {
        const roster = [member("#A", "Alice", "member"), member("#C", "Chloé", "member")];
        const result = run(roster, [log("#C", 100)]);

        assert.deepEqual(result.toKick, ["Alice"]);
    });

    it("demotes an elder who has no war log", () => {
        const roster = [member("#B", "Bob", "elder")];
        const result = run(roster, []);

        assert.deepEqual(result.toDemote, ["Bob"]);
    });

    it("ignores an absent member and a leader who have no war log", () => {
        const roster = [member("#F", "Fred", "member"), member("#E", "Émilie", "leader")];
        const result = run(roster, [], ["#F"]);

        assert.deepEqual(result, { toKick: [], toDemote: [] });
    });
});
