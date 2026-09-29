import { addAbsence, removeAbsencesByTag } from "../db/absences";
import { getClanMemberByTag } from "../db/members";
import { resolveAbsenceDates } from "../rules/absenceDates";

interface AbsenceOptions {
    tag: string,
    debut?: string,
    fin?: string,
    retirer?: boolean
}

export async function handleAbsence(options: AbsenceOptions, today: string): Promise<string> {
    try {
        const member = await getClanMemberByTag(options.tag);

        if (!member) {
            return `Aucun membre avec le tag \`${options.tag}\` trouvé dans le clan !`;
        }

        if (options.retirer) {
            await removeAbsencesByTag(options.tag);
            return `Toutes les absences du joueur \`${member.name}\` ont été supprimées !`;
        }

        const dates = resolveAbsenceDates(options.debut, options.fin, today);

        await addAbsence(options.tag, dates.startDate ,dates.endDate);

        const frenchStartDate = dates.startDate.split("-").reverse().join("-");
        const frenchEndDate = dates.endDate.split("-").reverse().join("-");

        return `Le joueur ${member.name} a été marqué absent du ${frenchStartDate} au ${frenchEndDate}.`;
        
    } catch (error) {
        return `Une erreur est survenue : ${(error as Error).message}`;
    }
}