import type { ClanMember } from "../db/members";
import type { WarLogRow } from "../db/warLogs";

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

    for (const log of warLogs) {
        if (log.tag === null) {
            continue;
        }

        const member = membersByTag.get(log.tag);

        if (!member || absentTags.has(log.tag)) {
            continue;
        }

        if (member.role === "coLeader" || member.role === "leader") {
            continue;
        }

        if (log.fame > 0) {
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
