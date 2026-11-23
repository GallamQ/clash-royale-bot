import { formatJokerLosses } from "../messages/jokerLosses";
import { buildJokerLossList } from "../rules/jokerLosses";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { loadJokerStates } from "./loadJokerStates";
import { publishOnce } from "./publishOnce";
import { runJob } from "./runJob";

async function main() {
    const data = await loadJokerStates();

    if (!data) {
        return;
    }

    const losses = buildJokerLossList(data.states, data.membersByTag);
    const message = formatJokerLosses(losses);

    const wasSent = await publishOnce("jokerLosses", data.warStartDate, () =>
        sendWebhookMessage(message, "jokerLosses"),
    );

    if (wasSent) {
        console.log("Joker losses sent.");
    } else {
        console.log("Joker losses already published.");
    }
}

runJob(main);
