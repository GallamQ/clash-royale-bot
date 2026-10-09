import { CLAN_TAG, getClanWarData } from "../api/clashApi";
import { getAllClanTags } from "../db/members";
import { saveWarLogs } from "../db/warLogs";
import { saveWar } from "../db/wars";
import type { War } from "../types/db";
import { getWarStartIndex, getWarStartDate, hasWarEnded } from "../rules/warStatus";
import { runJob } from "./runJob";
import { getClanToday } from "../utils/clanToday";

async function main() {
    console.log("Updating current war results...");

    const warData = await getClanWarData();
    const warStartIndex = getWarStartIndex(warData.periodIndex);

    if (hasWarEnded(warData.periodLogs, CLAN_TAG, warStartIndex, warData.periodType)) {
        console.log("War is over, nothing to update.");
        return;
    }

    const war: War = {
        startDate: getWarStartDate(new Date(), warData.periodIndex, warStartIndex),
        startIndex: warStartIndex,
        periodType: warData.periodType,
    };

    const warDate = getClanToday();
    const participants = warData.participants;
    const knownTags = await getAllClanTags();

    await saveWar(war);
    await saveWarLogs(war, warDate, participants, knownTags);

    console.log("Current war results updated.");
}

runJob(main);
