import { addDays } from "../utils/addDays";

type AbsenceDates = { startDate: string; endDate: string };

export function isWarExempt(
    warStartDate: string,
    joinDate: string,
    absences: AbsenceDates[],
): boolean {
    if (joinDate >= warStartDate) {
        return true;
    }

    const monday = addDays(warStartDate, -3);
    const sunday = addDays(warStartDate, +3);

    for (const absence of absences) {
        if (absence.endDate >= monday && absence.startDate <= sunday) {
            return true;
        }
    }

    return false;
}
