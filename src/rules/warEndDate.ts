import type { PeriodLog } from "../types/api";
import { addDays } from "../utils/addDays";

const WAR_LENGTH_DAYS = 4;
const WAR_END_POINTS = 10000;

export function getWarEndDate(
    warStartDate: string,
    warStartIndex: number,
    periodLogs: PeriodLog[],
    clanTag: string,
    periodType: string,
): string {
    if (periodType === "colosseum") {
        return addDays(warStartDate, WAR_LENGTH_DAYS);
    }

    const sortedLogs = [...periodLogs].sort((a, b) => a.periodIndex - b.periodIndex);

    for (const day of sortedLogs) {
        if (day.periodIndex < warStartIndex || day.periodIndex >= warStartIndex + WAR_LENGTH_DAYS) {
            continue;
        }

        for (const item of day.items) {
            if (item.clan.tag === clanTag && item.progressEndOfDay >= WAR_END_POINTS) {
                return addDays(warStartDate, day.periodIndex - warStartIndex + 1);
            }
        }
    }

    return addDays(warStartDate, WAR_LENGTH_DAYS);
}
