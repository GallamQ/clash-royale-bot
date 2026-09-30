import { type AbsenceWithName } from "../db/absences";
import { toFrenchDate } from "../utils/frenchDate";
import { safeName } from "../utils/safeName";

export function formatAbsencesList(absences: AbsenceWithName[]): string {
    if (absences.length === 0) {
        return "📋 **Liste des absents :** Aucun absent actuellement !";
    }

    const messageStart = "📋 **Liste des absents actuels :**\n\n";
    let absencesListMessage = "";

    for (let i = 0; i < absences.length; i++) {
        absencesListMessage += `• **${safeName(absences[i].name)}** - Du ${toFrenchDate(absences[i].start_date)} au ${toFrenchDate(absences[i].end_date)}\n`;
    }

    const message = messageStart + absencesListMessage;

    return message;
}