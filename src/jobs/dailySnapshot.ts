import { getClanRoster } from "../api/clashApi";
import { syncClanMembers } from "../db/members";
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

    await syncClanMembers(roster.members, getClanToday());

    console.log("Clan members updated.");
}

runJob(main);
