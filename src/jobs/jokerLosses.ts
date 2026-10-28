import { getAllClanMembers } from "../db/members";
import { getFrozenWars } from "../db/warResults";
import { formatJokerLosses } from "../messages/jokerLosses";
import { filterCountedWars } from "../rules/countedWars";
import { buildJokerLossList } from "../rules/jokerLosses";
import { replayJokers } from "../rules/jokers";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { runJob } from "./runJob";

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
    const losses = buildJokerLossList(states, membersByTag);
    const message = formatJokerLosses(losses);

    await sendWebhookMessage(message);

    console.log("Joker losses sent.");
}

runJob(main);
