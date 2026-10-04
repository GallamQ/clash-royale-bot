import { CLAN_TAG, getClanWarData } from "../api/clashApi";
import { getAllClanTags } from "../db/members";
import { saveWarLogs } from "../db/warLogs";
import { getWarStartIndex, hasWarEnded } from "../rules/warStatus";
import { runJob } from "./runJob";

async function main() {
    console.log("Updating current war results...");

    const warData = await getClanWarData();
    const warStartIndex = getWarStartIndex(warData.periodIndex);

    if (hasWarEnded(warData.periodLogs, CLAN_TAG, warStartIndex, warData.periodType)) {
        console.log("War is over, nothing to update.");
        return;
    }

    const warDate = new Date().toISOString().split("T")[0];
    const participants = warData.participants;
    const knownTags = await getAllClanTags();

    await saveWarLogs(warStartIndex.toString(), warDate, participants, knownTags);

    console.log("Current war results updated.");
}

runJob(main);
