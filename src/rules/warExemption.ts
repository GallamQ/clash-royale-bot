type AbsenceDates = { startDate: string; endDate: string };

function addDays(isoDate: string, days: number): string {
    const date = new Date(`${isoDate}T00:00:00Z`);

    date.setUTCDate(date.getUTCDate() + days);

    return date.toISOString().slice(0, 10);
}

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
