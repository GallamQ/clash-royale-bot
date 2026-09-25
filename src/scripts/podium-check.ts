import { buildPodium } from "../rules/podium";
import type { ClanMember } from "../db/members";
import type { WarLogRow } from "../db/warLogs";

function member(tag: string, name: string): ClanMember {
  return { tag, name, role: "member", join_date: "2026-01-01" };
}

function log(tag: string, fame: number): WarLogRow {
  return { id: 0, war_id: "test", war_date: "2026-09-21", tag, fame };
}

// Fred (#F) est volontairement absent du roster
const roster = [
  member("#A", "Alice"),
  member("#B", "Bob"),
  member("#C", "Chloé"),
  member("#D", "David"),
  member("#E", "Émilie"),
];
const membersByTag = new Map(roster.map((m) => [m.tag, m]));

const warLogs = [
  log("#A", 900),
  log("#B", 900),
  log("#C", 800),
  log("#D", 750),
  log("#E", 0),
  log("#F", 600),
];

const podium = buildPodium(warLogs, membersByTag);

for (const step of podium) {
  console.log(step.place, step.fame, step.players.map((p) => p.name));
}