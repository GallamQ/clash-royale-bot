import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ClanMember } from "../../types/db";
import type { WarResult } from "../../rules/warResults";
import { buildKickList } from "../../rules/kickList";

function member(tag: string, name: string, role: string): ClanMember {
    return { tag, name, role, joinDate: "2026-01-01" };
}

function result(tag: string, fame: number, role: string, exempt: boolean = false): WarResult {
    return { tag, fame, exempt, role };
}

function run(roster: ClanMember[], results: WarResult[]) {
    const membersByTag = new Map(roster.map((m) => [m.tag, m]));
    const list = buildKickList(results, membersByTag);

    return {
        toKick: list.toKick.map((m) => m.name),
        toDemote: list.toDemote.map((m) => m.name),
    };
}

describe("buildKickList", () => {
    it("kicks a member and demotes an elder who scored zero", () => {
        const roster = [member("#A", "Alice", "member"), member("#B", "Bob", "elder")];
        const list = run(roster, [result("#A", 0, "member"), result("#B", 0, "elder")]);

        assert.deepEqual(list, { toKick: ["Alice"], toDemote: ["Bob"] });
    });

    it("ignores members who scored points", () => {
        const roster = [member("#A", "Alice", "member"), member("#B", "Bob", "elder")];
        const list = run(roster, [result("#A", 100, "member"), result("#B", 100, "elder")]);

        assert.deepEqual(list, { toKick: [], toDemote: [] });
    });

    it("ignores leaders and co-leaders even with zero points", () => {
        const roster = [member("#D", "David", "coLeader"), member("#E", "Émilie", "leader")];
        const list = run(roster, [result("#D", 0, "coLeader"), result("#E", 0, "leader")]);

        assert.deepEqual(list, { toKick: [], toDemote: [] });
    });

    it("ignores exempt members with zero points", () => {
        const roster = [member("#F", "Fred", "member"), member("#B", "Bob", "elder")];
        const list = run(roster, [result("#F", 0, "member", true), result("#B", 0, "elder", true)]);

        assert.deepEqual(list, { toKick: [], toDemote: [] });
    });

    it("ignores results of members who left the clan", () => {
        const roster = [member("#A", "Alice", "member")];
        const list = run(roster, [result("#A", 100, "member"), result("#X", 0, "member")]);

        assert.deepEqual(list, { toKick: [], toDemote: [] });
    });

    it("ignores members who have no result", () => {
        const roster = [member("#A", "Alice", "member"), member("#N", "Nina", "member")];
        const list = run(roster, [result("#A", 0, "member")]);

        assert.deepEqual(list, { toKick: ["Alice"], toDemote: [] });
    });

    it("uses the role frozen in the result, not the current role", () => {
        const roster = [member("#B", "Bob", "member"), member("#C", "Chloé", "elder")];
        const list = run(roster, [result("#B", 0, "elder"), result("#C", 0, "member")]);

        assert.deepEqual(list, { toKick: ["Chloé"], toDemote: ["Bob"] });
    });

    it("returns empty lists without results", () => {
        const roster = [member("#A", "Alice", "member")];

        assert.deepEqual(run(roster, []), { toKick: [], toDemote: [] });
    });
});
