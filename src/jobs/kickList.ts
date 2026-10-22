import { getFrozenWars } from "../db/warResults";
import { getAllClanMembers } from "../db/members";
import { buildKickList } from "../rules/kickList";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { runJob } from "./runJob";
import { formatKickList } from "../messages/kickList";
import { replayJokers } from "../rules/jokers";
import { filterCountedWars } from "../rules/countedWars";

async function main() {
    const frozenWars = await getFrozenWars();
    const countedWars = filterCountedWars(frozenWars);

    if (countedWars.length === 0) {
        console.log("No counted war found.");
        return;
    }

    const states = replayJokers(countedWars);

    const clanMembers = await getAllClanMembers();
    const membersByTag = new Map(clanMembers.map((member) => [member.tag, member]));
    const list = buildKickList(states, membersByTag);
    const message = formatKickList(list);

    await sendWebhookMessage(message);

    console.log("Kick list sent.");
}

runJob(main);
