import type { PeriodLog } from "../types/api";

const WAR_WEEK_LENGTH = 7;
const TRAINING_DAYS = 3;
const WAR_END_POINTS = 10000;
const DAY_CHANGE_OFFSET_MS = (9 * 60 + 30) * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

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

export function getWarStartDate(now: Date, periodIndex: number, warStartIndex: number): string {
    const gameDayMs = now.getTime() - DAY_CHANGE_OFFSET_MS;
    const startMs = gameDayMs - (periodIndex - warStartIndex) * DAY_MS;

    return new Date(startMs).toISOString().slice(0, 10);
}
