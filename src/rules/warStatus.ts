import type { PeriodLog } from "../api/clashApi";

const WAR_WEEK_LENGTH = 7;
const TRAINING_DAYS = 3;
const WAR_END_POINTS = 10000;

export function getWarStartIndex(periodIndex: number): number {
    return periodIndex - ((periodIndex - TRAINING_DAYS) % WAR_WEEK_LENGTH);
}

export function hasWarEnded(
    periodLogs: PeriodLog[],
    clanTag: string,
    warStartIndex: number,
    periodType: string,
): boolean {
    if (periodType === "colosseum") {
        return false;
    }

    const currentWarDays = periodLogs.filter((day) => day.periodIndex >= warStartIndex);

    return currentWarDays.some((day) =>
        day.items.some(
            (item) => item.clan.tag === clanTag && item.progressEndOfDay >= WAR_END_POINTS,
        ),
    );
}
