import { getClanMembers } from "../api/clashApi";
import { syncClanMembers } from "../db/members";
import { runJob } from "./runJob";

async function main() {
    console.log("Updating clan members...");

    const members = await getClanMembers();

    await syncClanMembers(members);

    console.log("Clan members updated.");
}

runJob(main);
