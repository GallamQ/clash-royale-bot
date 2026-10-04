import type { ClanMember } from "../types/db";

export interface MemberChoice {
    name: string;
    value: string;
}

export function buildMemberChoices(members: ClanMember[], query: string): MemberChoice[] {
    const search = query.toLowerCase();

    return members
        .filter(
            (member) =>
                member.name.toLowerCase().includes(search) ||
                member.tag.toLowerCase().includes(search),
        )
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 25)
        .map((member) => ({ name: `${member.name} (${member.tag})`, value: member.tag }));
}
