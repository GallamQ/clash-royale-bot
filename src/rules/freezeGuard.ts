import { WAR_LENGTH_DAYS } from "./warEndDate";
import { addDays } from "../utils/addDays";

export function isFreezeOverdue(openWarStartDate: string | null, gameDay: string): boolean {
    if (openWarStartDate === null) {
        return false;
    }

    return addDays(openWarStartDate, WAR_LENGTH_DAYS) <= gameDay;
}
