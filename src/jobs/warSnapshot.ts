import { CLAN_TAG, getClanWarData } from "../api/clashApi";
import { getAllClanTags } from "../db/members";
import { saveWarLogs } from "../db/warLogs";
import { saveWar, getOpenWar } from "../db/wars";
import type { War } from "../types/db";
import {
    getWarStartIndex,
    getWarStartDate,
    hasWarEnded,
    isThursday,
    isWarPeriodOver,
    pickWarStartDate,
} from "../rules/warStatus";
import { runJob } from "./runJob";

async function main() {
    console.log("Updating current war results...");

    const warData = await getClanWarData();
    const warStartIndex = getWarStartIndex(warData.periodIndex);

    console.log(`periodIndex ${warData.periodIndex} (${warData.periodType}).`);

    if (isWarPeriodOver(warData.periodIndex, warStartIndex)) {
        console.log("War period is over, nothing to update.");
        return;
    }

    if (hasWarEnded(warData.periodLogs, CLAN_TAG, warStartIndex, warData.periodType)) {
        console.log("War is over, nothing to update.");
        return;
    }

    const openWar = await getOpenWar();

    const war: War = {
        startDate: pickWarStartDate(
            openWar,
            warStartIndex,
            getWarStartDate(new Date(), warData.periodIndex, warStartIndex),
        ),
        startIndex: warStartIndex,
        periodType: warData.periodType,
    };

    if (!isThursday(war.startDate)) {
        throw new Error(`War start date ${war.startDate} is not a Thursday.`);
    }

    const participants = warData.participants;
    const knownTags = await getAllClanTags();

    await saveWar(war);
    await saveWarLogs(war, participants, knownTags);

    console.log("Current war results updated.");
}

runJob(main);
