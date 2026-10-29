import { buildKickList } from "../rules/kickList";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { runJob } from "./runJob";
import { formatKickList } from "../messages/kickList";
import { loadJokerStates } from "./loadJokerStates";

async function main() {
    const data = await loadJokerStates();

    if (!data) {
        return;
    }

    const list = buildKickList(data.states, data.membersByTag);
    const message = formatKickList(list);

    await sendWebhookMessage(message);

    console.log("Kick list sent.");
}

runJob(main);
