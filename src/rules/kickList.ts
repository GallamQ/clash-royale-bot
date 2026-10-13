import type { ClanMember } from "../types/db";
import type { WarResult } from "./warResults";

export type KickList = {
    toKick: ClanMember[];
    toDemote: ClanMember[];
};

export function buildKickList(
    results: WarResult[],
    membersByTag: Map<string, ClanMember>,
): KickList {
    const toKick: ClanMember[] = [];
    const toDemote: ClanMember[] = [];

    for (const result of results) {
        if (result.exempt || result.fame > 0) {
            continue;
        }

        const member = membersByTag.get(result.tag);

        if (!member) {
            continue;
        }

        if (result.role === "member") {
            toKick.push(member);
        } else if (result.role === "elder") {
            toDemote.push(member);
        }
    }

    return { toKick, toDemote };
}
