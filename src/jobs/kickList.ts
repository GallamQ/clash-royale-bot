import { getLatestWarLogs } from "../db/warLogs";
import { getAllClanMembers } from "../db/members";
import { getAllAbsences } from "../db/absences";
import { type KickList, buildKickList } from "../rules/kickList";
import { safeName } from "../utils/safeName";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { runJob } from "./runJob";

function formatKickList(list: KickList): string {
    if (list.toKick.length === 0 && list.toDemote.length === 0) {
        return "✅ Tous les joueurs ont marqué des points !";
    }

    let message = "**Liste des joueurs sans aucun point ➡️🚪**\n\n";

    if (list.toKick.length > 0) {
        message += `**🚪 À KICKER (${list.toKick.length}) :**\n`;

        for (const member of list.toKick) {
            message += `❌ ${safeName(member.name)}\n`;
        }

        message += "\n";
    }

    if (list.toDemote.length > 0) {
        message += `**⬇️ À RÉTROGRADER (Aîné → Membre) (${list.toDemote.length}) :**\n`;

        for (const member of list.toDemote) {
            message += `⚠️ ${safeName(member.name)}\n`;
        }
    }

    return message;
}

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
