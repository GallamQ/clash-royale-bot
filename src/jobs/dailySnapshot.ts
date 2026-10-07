import { getClanMembers } from "../api/clashApi";
import { syncClanMembers } from "../db/members";
import { getClanToday } from "../utils/clanToday";
import { runJob } from "./runJob";

async function main() {
    console.log("Updating clan members...");

    const members = await getClanMembers();

    await syncClanMembers(members, getClanToday());

    console.log("Clan members updated.");
}

runJob(main);
