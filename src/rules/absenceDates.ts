import { UserError } from "../utils/userError";

function parseFrenchDate(text: string): Date {
    const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(text);

    if (!match) {
        throw new UserError(`Date invalide « ${text} » : utilise le format JJ-MM-AAAA.`);
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw new UserError(`La date ${text} n'existe pas.`);
    }

    return date;
}

function toIso(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export function resolveAbsenceDates(
    debut: string | undefined,
    fin: string | undefined,
    today: string,
): { startDate: string; endDate: string } {
    if (!debut || !fin) {
        const [year, month, day] = today.split("-").map(Number);
        const current = new Date(Date.UTC(year, month - 1, day));
        const daysSinceMonday = (current.getUTCDay() + 6) % 7;
        const monday = new Date(current);

        monday.setUTCDate(current.getUTCDate() - daysSinceMonday);

        const sunday = new Date(monday);

        sunday.setUTCDate(monday.getUTCDate() + 6);

        return { startDate: toIso(monday), endDate: toIso(sunday) };
    }

    const start = parseFrenchDate(debut);
    const end = parseFrenchDate(fin);

    if (end < start) {
        throw new UserError("La date de fin est antérieure à la date de début.");
    }

    return { startDate: toIso(start), endDate: toIso(end) };
}
