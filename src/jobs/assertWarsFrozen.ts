import { getOpenWar } from "../db/wars";
import { isFreezeOverdue } from "../rules/freezeGuard";
import { getGameDay } from "../rules/warStatus";

export async function assertWarsFrozen(): Promise<void> {
    const openWar = await getOpenWar();
    const openWarStartDate = openWar?.startDate ?? null;
    const gameDay = getGameDay(new Date());

    if (isFreezeOverdue(openWarStartDate, gameDay)) {
        throw new Error(`War ${openWarStartDate} is not frozen yet.`);
    }
}
