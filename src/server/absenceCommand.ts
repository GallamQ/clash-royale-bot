import { addAbsence, getActiveAbsences, removeAbsencesByTag } from "../db/absences";
import { getClanMemberByTag } from "../db/members";
import { resolveAbsenceDates } from "../rules/absenceDates";
import { toFrenchDate } from "../utils/frenchDate";
import { formatAbsencesList } from "../messages/absencesList";
import { safeName } from "../utils/safeName";
import { UserError } from "../utils/userError";

interface AbsenceOptions {
    tag: string;
    debut?: string;
    fin?: string;
    retirer?: boolean;
}

async function withAbsencesList(confirmation: string): Promise<string> {
    const absences = await getActiveAbsences();
    const list = formatAbsencesList(absences);

    return `${confirmation}\n\n${list}`;
}

export async function handleAbsence(options: AbsenceOptions, today: string): Promise<string> {
    try {
        const member = await getClanMemberByTag(options.tag);

        if (!member) {
            return `Aucun membre avec le tag \`${options.tag}\` trouvé dans le clan !`;
        }

        if (options.retirer) {
            await removeAbsencesByTag(options.tag);
            return await withAbsencesList(
                `Toutes les absences du joueur \`${safeName(member.name)}\` ont été supprimées !`,
            );
        }

        const dates = resolveAbsenceDates(options.debut, options.fin, today);

        await addAbsence(options.tag, dates.startDate, dates.endDate);

        const frenchStartDate = toFrenchDate(dates.startDate);
        const frenchEndDate = toFrenchDate(dates.endDate);

        return await withAbsencesList(
            `Le joueur \`${safeName(member.name)}\` a été marqué absent du ${frenchStartDate} au ${frenchEndDate}.`,
        );
    } catch (error) {
        if (error instanceof UserError) {
            return `Une erreur est survenue : ${error.message}`;
        }

        console.error("Absence command failed:", error);

        return "Une erreur technique est survenue, réessaie plus tard.";
    }
}
