import { addDays } from "../utils/addDays";

export const DEPARTED_MEMBER_RETENTION_DAYS = 90;

export function getPurgeCutoffDate(today: string): string {
    return addDays(today, -DEPARTED_MEMBER_RETENTION_DAYS);
}
