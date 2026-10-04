import { CLAN_TAG, getClanWarData } from "../api/clashApi";
import { getAllClanTags } from "../db/members";
import { saveWarLogs } from "../db/warLogs";
import { getWarStartIndex, hasWarEnded } from "../rules/warStatus";
import { runJob } from "./runJob";

async function main() {
    console.log("Mise à jour des résultats de la guerre en cours...");

    const warData = await getClanWarData();
    const clanTag = `#${CLAN_TAG}`;
    const warId = getWarStartIndex(warData.periodIndex);

    if (hasWarEnded(warData.periodLogs, clanTag, warId, warData.periodType)) {
        console.log("Guerre terminée !");
        return;
    }

    const warDate = new Date().toISOString().split("T")[0];
    const participants = warData.participants;
    const knownTags = await getAllClanTags();

    await saveWarLogs(warId.toString(), warDate, participants, knownTags);

    console.log("Mise à jour de la guerre en cours terminée !");
}

runJob(main);
