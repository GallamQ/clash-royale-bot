import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Absence, ClanMember, WarLogRow } from "../../types/db";
import { buildWarResults } from "../../rules/warResults";

const WAR_START = "2026-10-08";
const LONG_AGO = "2026-01-01";

function member(tag: string, role: string, joinDate: string = LONG_AGO): ClanMember {
    return { tag, name: tag, role, joinDate };
}

function log(tag: string | null, fame: number): WarLogRow {
    return { id: 0, tag, fame };
}

function absence(tag: string, startDate: string, endDate: string): Absence {
    return { tag, startDate, endDate };
}

describe("buildWarResults", () => {
    it("returns nothing without members", () => {
        assert.deepEqual(buildWarResults(WAR_START, [], [log("#A", 100)], []), []);
    });

    it("returns one result per member with the fame of the war", () => {
        const members = [member("#A", "member"), member("#B", "elder")];
        const results = buildWarResults(WAR_START, members, [log("#A", 100), log("#B", 50)], []);

        assert.deepEqual(results, [
            { tag: "#A", fame: 100, exempt: false, role: "member" },
            { tag: "#B", fame: 50, exempt: false, role: "elder" },
        ]);
    });

    it("counts zero points for a member without war log", () => {
        const results = buildWarResults(WAR_START, [member("#A", "member")], [], []);

        assert.deepEqual(results, [{ tag: "#A", fame: 0, exempt: false, role: "member" }]);
    });

    it("ignores war logs without tag", () => {
        const results = buildWarResults(WAR_START, [member("#A", "member")], [log(null, 500)], []);

        assert.deepEqual(results, [{ tag: "#A", fame: 0, exempt: false, role: "member" }]);
    });

    it("keeps the role of every member, leaders included", () => {
        const members = [member("#A", "leader"), member("#B", "coLeader")];
        const results = buildWarResults(WAR_START, members, [], []);

        assert.deepEqual(
            results.map((result) => result.role),
            ["leader", "coLeader"],
        );
    });

    it("marks a member who joined during the war as exempt", () => {
        const members = [member("#A", "member", "2026-10-10")];
        const results = buildWarResults(WAR_START, members, [], []);

        assert.deepEqual(results, [{ tag: "#A", fame: 0, exempt: true, role: "member" }]);
    });

    it("marks a member with an absence during the week as exempt", () => {
        const absences = [absence("#A", "2026-10-06", "2026-10-07")];
        const results = buildWarResults(WAR_START, [member("#A", "member")], [], absences);

        assert.deepEqual(results, [{ tag: "#A", fame: 0, exempt: true, role: "member" }]);
    });

    it("does not exempt a member because of the absence of another member", () => {
        const members = [member("#A", "member"), member("#B", "member")];
        const absences = [absence("#B", "2026-10-06", "2026-10-07")];
        const results = buildWarResults(WAR_START, members, [], absences);

        assert.deepEqual(
            results.map((result) => result.exempt),
            [false, true],
        );
    });

    it("keeps the points of an exempt member", () => {
        const members = [member("#A", "member", "2026-10-10")];
        const results = buildWarResults(WAR_START, members, [log("#A", 300)], []);

        assert.deepEqual(results, [{ tag: "#A", fame: 300, exempt: true, role: "member" }]);
    });
});
