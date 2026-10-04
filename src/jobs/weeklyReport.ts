import { getLatestWarLogs } from "../db/warLogs";
import { getAllClanMembers } from "../db/members";
import { buildPodium } from "../rules/podium";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { runJob } from "./runJob";
import { formatPodium } from "../messages/podium";

async function main() {
    console.log("Generating weekly report...");

    const warLogs = await getLatestWarLogs();

    if (!warLogs.length) {
        console.log("No war data found.");
        return;
    }

    const clanMembers = await getAllClanMembers();
    const clanMembersMap = new Map(clanMembers.map((member) => [member.tag, member]));
    const podium = buildPodium(warLogs, clanMembersMap);
    const message = formatPodium(warLogs[0].war_id, podium);

    await sendWebhookMessage(message);

    console.log("Weekly report sent.");
}

runJob(main);
