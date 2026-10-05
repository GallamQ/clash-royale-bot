import { buildKickList } from "../rules/kickList";
import type { ClanMember, WarLogRow } from "../types/db";

function member(tag: string, name: string, role: string): ClanMember {
    return { tag, name, role, joinDate: "2026-01-01" };
}

function log(tag: string, fame: number): WarLogRow {
    return { id: 0, war_id: "test", war_date: "2026-10-01", tag, fame };
}

const roster = [
    member("#A", "Alice", "member"),
    member("#B", "Bob", "elder"),
    member("#C", "Chloé", "member"),
    member("#D", "David", "coLeader"),
    member("#E", "Émilie", "leader"),
    member("#F", "Fred", "member"),
    member("#G", "Billy", "elder"),
];
const membersByTag = new Map(roster.map((m) => [m.tag, m]));

const absentTags = new Set(["#F"]);

const warLogs = [
    log("#A", 0),
    log("#B", 0),
    log("#C", 100),
    log("#D", 0),
    log("#E", 0),
    log("#F", 0),
    log("#X", 0),
    log("#G", 100),
];

const result = buildKickList(warLogs, membersByTag, absentTags);

console.log(
    "To kick:",
    result.toKick.map((m) => m.name),
);
console.log(
    "To demote:",
    result.toDemote.map((m) => m.name),
);
