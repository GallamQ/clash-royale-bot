import type { PeriodLog } from "../types/api";
import type { War } from "../types/db";
import { addDays } from "../utils/addDays";
import { WAR_LENGTH_DAYS } from "./warEndDate";

const WAR_WEEK_LENGTH = 7;
const TRAINING_DAYS = 3;
const WAR_END_POINTS = 10000;
const THURSDAY = 4;
const DAY_CHANGE_OFFSET_MS = (9 * 60 + 30) * 60 * 1000;

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

export function getGameDay(now: Date): string {
    return new Date(now.getTime() - DAY_CHANGE_OFFSET_MS).toISOString().slice(0, 10);
}

export function getWarStartDate(now: Date, periodIndex: number, warStartIndex: number): string {
    return addDays(getGameDay(now), warStartIndex - periodIndex);
}

export function isWarPeriodOver(periodIndex: number, warStartIndex: number): boolean {
    return periodIndex >= warStartIndex + WAR_LENGTH_DAYS;
}

export function pickWarStartDate(
    openWar: War | null,
    warStartIndex: number,
    computedDate: string,
): string {
    if (openWar !== null && openWar.startIndex === warStartIndex) {
        return openWar.startDate;
    }

    return computedDate;
}

export function isThursday(isoDate: string): boolean {
    const date = new Date(`${isoDate}T00:00:00Z`);

    return date.getUTCDay() === THURSDAY;
}

export function isWarFinished(
    periodIndex: number,
    warStartIndex: number,
    periodLogs: PeriodLog[],
    clanTag: string,
    periodType: string,
): boolean {
    return (
        isWarPeriodOver(periodIndex, warStartIndex) ||
        hasWarEnded(periodLogs, clanTag, warStartIndex, periodType)
    );
}
