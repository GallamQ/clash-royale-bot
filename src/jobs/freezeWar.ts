import { CLAN_TAG, getClanWarData } from "../api/clashApi";
import { getAllAbsences } from "../db/absences";
import { getAllClanMembers } from "../db/members";
import { getWarLogsByStartDate } from "../db/warLogs";
import { saveWarResults } from "../db/warResults";
import { closeWar, getOpenWar } from "../db/wars";
import { getWarEndDate } from "../rules/warEndDate";
import { buildWarResults } from "../rules/warResults";
import { getGameDay } from "../rules/warStatus";
import { runJob } from "./runJob";

async function main() {
    console.log("Freezing war results...");

    const war = await getOpenWar();

    if (war === null) {
        console.log("No open war to freeze.");
        return;
    }

    const warData = await getClanWarData();
    const endDate = getWarEndDate(
        war.startDate,
        war.startIndex,
        warData.periodLogs,
        CLAN_TAG,
        war.periodType,
    );

    if (endDate > getGameDay(new Date())) {
        console.log("War is not over yet.");
        return;
    }

    const members = await getAllClanMembers();
    const warLogs = await getWarLogsByStartDate(war.startDate);
    const absences = await getAllAbsences();
    const results = buildWarResults(war.startDate, members, warLogs, absences);

    console.log(`War ${war.startDate} ended on ${endDate}.`);

    await saveWarResults(war.startDate, results);
    await closeWar(war.startDate, endDate);

    console.log(`War ${war.startDate} frozen: ${results.length} results.`);
}

runJob(main);
