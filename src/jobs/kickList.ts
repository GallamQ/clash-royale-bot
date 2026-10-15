import { getFrozenWars } from "../db/warResults";
import { getAllClanMembers } from "../db/members";
import { buildKickList } from "../rules/kickList";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { runJob } from "./runJob";
import { formatKickList } from "../messages/kickList";
import { replayJokers } from "../rules/jokers";

async function main() {
    const frozenWars = await getFrozenWars();

    if (frozenWars.length === 0) {
        console.log("No frozen war found.");
        return;
    }

    const states = replayJokers(frozenWars);

    const clanMembers = await getAllClanMembers();
    const membersByTag = new Map(clanMembers.map((member) => [member.tag, member]));
    const list = buildKickList(states, membersByTag);
    const message = formatKickList(list);

    await sendWebhookMessage(message);

    console.log("Kick list sent.");
}

runJob(main);
