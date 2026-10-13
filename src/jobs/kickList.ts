import { getLatestFrozenWar } from "../db/warResults";
import { getAllClanMembers } from "../db/members";
import { buildKickList } from "../rules/kickList";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { runJob } from "./runJob";
import { formatKickList } from "../messages/kickList";

async function main() {
    const frozenWar = await getLatestFrozenWar();

    if (!frozenWar) {
        console.log("No frozen war found.");
        return;
    }

    const clanMembers = await getAllClanMembers();
    const membersByTag = new Map(clanMembers.map((member) => [member.tag, member]));
    const list = buildKickList(frozenWar.results, membersByTag);
    const message = formatKickList(list);

    await sendWebhookMessage(message);

    console.log("Kick list sent.");
}

runJob(main);
