import { getLatestWarLogs } from "../db/warLogs";
import { getAllClanMembers } from "../db/members";
import { getAllAbsences } from "../db/absences";
import { buildKickList } from "../rules/kickList";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { runJob } from "./runJob";
import { formatKickList } from "../messages/kickList";

async function main() {
    const warLogs = await getLatestWarLogs();

    if (!warLogs.length) {
        console.log("Aucune donnée de guerre trouvée !");
        return;
    }

    const clanMembers = await getAllClanMembers();
    const membersByTag = new Map(clanMembers.map((member) => [member.tag, member]));
    const absences = await getAllAbsences();
    const absentTags = new Set(absences.map((absence) => absence.tag));
    const list = buildKickList(warLogs, membersByTag, absentTags);
    const message = formatKickList(list);

    await sendWebhookMessage(message);

    console.log("Liste envoyée !");
}

runJob(main);
