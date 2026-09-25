import type { ClanMember } from "../db/members";
import type { WarLogRow } from "../db/warLogs";

export type PodiumStep = {
  place: 1 | 2 | 3;
  fame: number;
  players: ClanMember[];
};

export function buildPodium(warLogs: WarLogRow[], membersByTag: Map<string, ClanMember>): PodiumStep[] {
  const eligible = warLogs.filter(
    (log) => log.fame > 0 && membersByTag.has(log.tag)
  );

  const topScores = Array.from(new Set(eligible.map((log) => log.fame)))
    .sort((a, b) => b - a)
    .slice(0, 3);
  
  return topScores.map((score, index) => ({
    place: (index + 1) as 1 | 2 | 3,
    fame: score,
    players: eligible
      .filter((log) => log.fame === score)
      .map((log) => membersByTag.get(log.tag))
  }));
}