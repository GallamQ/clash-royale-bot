import type { ClanMember, WarLogRow } from "../types/db";

export type PodiumStep = {
    place: 1 | 2 | 3;
    fame: number;
    players: ClanMember[];
};

export function buildPodium(
    warLogs: WarLogRow[],
    membersByTag: Map<string, ClanMember>,
): PodiumStep[] {
    const eligible = warLogs.flatMap((log) => {
        if (log.tag === null || log.fame <= 0) {
            return [];
        }

        const member = membersByTag.get(log.tag);

        return member ? [{ member, fame: log.fame }] : [];
    });

    const topScores = Array.from(new Set(eligible.map((entry) => entry.fame)))
        .sort((a, b) => b - a)
        .slice(0, 3);

    return topScores.map((score, index) => ({
        place: (index + 1) as 1 | 2 | 3,
        fame: score,
        players: eligible.filter((entry) => entry.fame === score).map((entry) => entry.member),
    }));
}
