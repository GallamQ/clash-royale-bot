import { getClanRoster } from "../api/clashApi";
import { purgeDepartedMembers, syncClanMembers } from "../db/members";
import { getPurgeCutoffDate } from "../rules/departedMembers";
import { isRosterComplete } from "../rules/rosterCompleteness";
import { getClanToday } from "../utils/clanToday";
import { runJob } from "./runJob";

async function main() {
    console.log("Updating clan members...");

    const roster = await getClanRoster();
    const receivedCount = roster.members.length;

    if (!isRosterComplete(roster.announcedCount, receivedCount)) {
        throw new Error(
            `Incomplete clan roster: ${receivedCount} received, ${roster.announcedCount} announced.`,
        );
    }

    const today = getClanToday();

    await syncClanMembers(roster.members, today);

    const cutoffDate = getPurgeCutoffDate(today);
    const purgedTags = await purgeDepartedMembers(cutoffDate);

    console.log(`Purged ${purgedTags.length} departed members.`);
    console.log("Clan members updated.");
}

runJob(main);
