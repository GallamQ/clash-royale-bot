import type { AbsenceWithName } from "../types/db";
import { toFrenchDate } from "../utils/frenchDate";
import { safeName } from "../utils/safeName";

export function formatAbsencesList(absences: AbsenceWithName[]): string {
    if (absences.length === 0) {
        return "📋 **Liste des absents :** Aucun absent actuellement !";
    }

    const messageStart = "📋 **Liste des absents actuels :**\n\n";
    let absencesListMessage = "";

    for (const absence of absences) {
        absencesListMessage += `• **${safeName(absence.name)}** - Du ${toFrenchDate(absence.start_date)} au ${toFrenchDate(absence.end_date)}\n`;
    }

    const message = messageStart + absencesListMessage;

    return message;
}
