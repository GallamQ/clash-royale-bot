import { PeriodLog } from "../api/clashApi";

export function hasWarEnded(periodLogs: PeriodLog[], clanTag: string): boolean {
    return periodLogs.some((day) =>
        day.items.some((item) => item.clan.tag === clanTag && item.progressEndOfDay >= 10000)
    );
}