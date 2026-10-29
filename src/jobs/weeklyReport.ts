import { getLatestFrozenWar } from "../db/warResults";
import { getAllClanMembers } from "../db/members";
import { buildPodium } from "../rules/podium";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { runJob } from "./runJob";
import { formatPodium } from "../messages/podium";
import { toFrenchDate } from "../utils/frenchDate";
import { assertWarsFrozen } from "./assertWarsFrozen";

async function main() {
    console.log("Generating weekly report...");

    await assertWarsFrozen();

    const frozenWar = await getLatestFrozenWar();

    if (!frozenWar) {
        console.log("No frozen war found.");
        return;
    }

    const clanMembers = await getAllClanMembers();
    const membersByTag = new Map(clanMembers.map((member) => [member.tag, member]));
    const podium = buildPodium(frozenWar.results, membersByTag);
    const message = formatPodium(toFrenchDate(frozenWar.startDate), podium);

    await sendWebhookMessage(message);

    console.log("Weekly report sent.");
}

runJob(main);
