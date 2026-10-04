import type { KickList } from "../rules/kickList";
import { safeName } from "../utils/safeName";

export function formatKickList(list: KickList): string {
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
