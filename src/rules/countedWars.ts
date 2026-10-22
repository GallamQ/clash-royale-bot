import type { WarHistoryEntry } from "./jokers";

export const FIRST_COUNTED_WAR_DATE = "2026-10-22";

export function filterCountedWars(wars: WarHistoryEntry[]): WarHistoryEntry[] {
    return wars.filter((war) => war.startDate >= FIRST_COUNTED_WAR_DATE);
}
