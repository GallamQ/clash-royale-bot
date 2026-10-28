import type { ClanMember } from "../types/db";
import type { JokerState } from "./jokers";

export type JokerLoss = {
    member: ClanMember;
    jokersLeft: number;
};

export function buildJokerLossList(
    states: Map<string, JokerState>,
    membersByTag: Map<string, ClanMember>,
): JokerLoss[] {
    const losses: JokerLoss[] = [];

    for (const [tag, state] of states) {
        const member = membersByTag.get(tag);

        if (!member) {
            continue;
        }

        if (state.outcome === "jokerUsed") {
            losses.push({ member, jokersLeft: state.jokers });
        }
    }

    return losses;
}
