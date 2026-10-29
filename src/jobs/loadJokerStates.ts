import { getAllClanMembers } from "../db/members";
import { getFrozenWars } from "../db/warResults";
import { filterCountedWars } from "../rules/countedWars";
import { replayJokers } from "../rules/jokers";
import type { JokerState } from "../rules/jokers";
import type { ClanMember } from "../types/db";
import { assertWarsFrozen } from "./assertWarsFrozen";

export type JokerData = {
    states: Map<string, JokerState>;
    membersByTag: Map<string, ClanMember>;
};

export async function loadJokerStates(): Promise<JokerData | undefined> {
    await assertWarsFrozen();

    const frozenWars = await getFrozenWars();
    const countedWars = filterCountedWars(frozenWars);

    if (countedWars.length === 0) {
        console.log("No counted war found.");
        return;
    }

    const states = replayJokers(countedWars);
    const clanMembers = await getAllClanMembers();
    const membersByTag = new Map(clanMembers.map((member) => [member.tag, member]));

    return { states, membersByTag };
}
