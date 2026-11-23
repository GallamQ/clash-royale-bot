import { buildKickList } from "../rules/kickList";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { runJob } from "./runJob";
import { formatKickList } from "../messages/kickList";
import { loadJokerStates } from "./loadJokerStates";
import { publishOnce } from "./publishOnce";

async function main() {
    const data = await loadJokerStates();

    if (!data) {
        return;
    }

    const list = buildKickList(data.states, data.membersByTag);
    const message = formatKickList(list);

    const wasSent = await publishOnce("kickList", data.warStartDate, () =>
        sendWebhookMessage(message, "kickList"),
    );

    if (wasSent) {
        console.log("Kick list sent.");
    } else {
        console.log("Kick list already published.");
    }
}

runJob(main);
