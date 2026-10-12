import type { Absence, ClanMember, WarLogRow } from "../types/db";
import { isWarExempt } from "./warExemption";

export type WarResult = {
    tag: string;
    fame: number;
    exempt: boolean;
    role: string;
};

export function buildWarResults(
    warStartDate: string,
    members: ClanMember[],
    warLogs: WarLogRow[],
    absences: Absence[],
): WarResult[] {
    const fameByTag = new Map<string, number>();

    for (const log of warLogs) {
        if (log.tag !== null) {
            fameByTag.set(log.tag, log.fame);
        }
    }

    const results: WarResult[] = [];

    for (const member of members) {
        const memberAbsences = absences.filter((absence) => absence.tag === member.tag);
        const fame = fameByTag.get(member.tag) ?? 0;
        const exempt = isWarExempt(warStartDate, member.joinDate, memberAbsences);

        results.push({ tag: member.tag, fame, exempt, role: member.role });
    }

    return results;
}
