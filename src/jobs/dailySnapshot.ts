import { getClanMembers } from "../api/clashApi";
import { syncClanMembers } from "../db/members";
import { runJob } from "./runJob";

async function main() {
    console.log("Mise à jour quotidienne des membres du clan en cours...");

    const members = await getClanMembers();

    await syncClanMembers(members);

    console.log("Mise à jour des membres terminée !");
}

runJob(main);
