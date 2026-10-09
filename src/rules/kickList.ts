import type { ClanMember, WarLogRow } from "../types/db";

export type KickList = {
    toKick: ClanMember[];
    toDemote: ClanMember[];
};

export function buildKickList(
    warLogs: WarLogRow[],
    membersByTag: Map<string, ClanMember>,
    absentTags: Set<string>,
): KickList {
    const toKick: ClanMember[] = [];
    const toDemote: ClanMember[] = [];
    const fameByTag = new Map<string, number>();

    for (const log of warLogs) {
        if (log.tag !== null) {
            fameByTag.set(log.tag, log.fame);
        }
    }

    for (const member of membersByTag.values()) {
        if (absentTags.has(member.tag)) {
            continue;
        }

        if (member.role === "coLeader" || member.role === "leader") {
            continue;
        }

        const fame = fameByTag.get(member.tag) ?? 0;

        if (fame > 0) {
            continue;
        }

        if (member.role === "member") {
            toKick.push(member);
        } else if (member.role === "elder") {
            toDemote.push(member);
        }
    }

    return { toKick, toDemote };
}
