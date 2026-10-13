import type { ClanMember } from "../types/db";

export type PodiumEntry = { tag: string | null; fame: number };

export type PodiumStep = {
    place: 1 | 2 | 3;
    fame: number;
    players: ClanMember[];
};

export function getTopScores(entries: { fame: number }[]): number[] {
    const scores = entries.filter((entry) => entry.fame > 0).map((entry) => entry.fame);

    return Array.from(new Set(scores))
        .sort((a, b) => b - a)
        .slice(0, 3);
}

export function buildPodium(
    entries: PodiumEntry[],
    membersByTag: Map<string, ClanMember>,
): PodiumStep[] {
    const eligible = entries.flatMap((entry) => {
        if (entry.tag === null || entry.fame <= 0) {
            return [];
        }

        const member = membersByTag.get(entry.tag);

        return member ? [{ member, fame: entry.fame }] : [];
    });

    const topScores = getTopScores(eligible);

    return topScores.map((score, index) => ({
        place: (index + 1) as 1 | 2 | 3,
        fame: score,
        players: eligible.filter((entry) => entry.fame === score).map((entry) => entry.member),
    }));
}
