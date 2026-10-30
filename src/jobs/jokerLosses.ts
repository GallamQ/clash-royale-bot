import { formatJokerLosses } from "../messages/jokerLosses";
import { buildJokerLossList } from "../rules/jokerLosses";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { loadJokerStates } from "./loadJokerStates";
import { runJob } from "./runJob";

async function main() {
    const data = await loadJokerStates();

    if (!data) {
        return;
    }

    const losses = buildJokerLossList(data.states, data.membersByTag);
    const message = formatJokerLosses(losses);

    await sendWebhookMessage(message, "jokerLosses");

    console.log("Joker losses sent.");
}

runJob(main);
