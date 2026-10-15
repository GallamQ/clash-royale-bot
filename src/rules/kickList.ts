import type { ClanMember } from "../types/db";
import type { JokerState } from "./jokers";

export type KickList = {
    toKick: ClanMember[];
    toDemote: ClanMember[];
};

export function buildKickList(
    states: Map<string, JokerState>,
    membersByTag: Map<string, ClanMember>,
): KickList {
    const toKick: ClanMember[] = [];
    const toDemote: ClanMember[] = [];

    for (const [tag, state] of states) {
        const member = membersByTag.get(tag);

        if (!member) {
            continue;
        }

        if (state.outcome === "kick") {
            toKick.push(member);
        } else if (state.outcome === "demote") {
            toDemote.push(member);
        }
    }

    return { toKick, toDemote };
}
