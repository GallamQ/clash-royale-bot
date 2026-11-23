import { deleteExpiredAbsences, getAllAbsences } from "../db/absences";
import { formatAbsencesList } from "../messages/absencesList";
import { getClanToday } from "../utils/clanToday";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { assertWarsFrozen } from "./assertWarsFrozen";
import { publishOnce } from "./publishOnce";
import { runJob } from "./runJob";

async function main() {
    await assertWarsFrozen();

    console.log("Deleting expired absences...");

    const today = getClanToday();

    await deleteExpiredAbsences(today);

    console.log("Expired absences deleted.");

    const updatedAbsencesList = await getAllAbsences();
    const message = formatAbsencesList(updatedAbsencesList);

    const wasSent = await publishOnce("absences", today, () =>
        sendWebhookMessage(message, "absences"),
    );

    if (wasSent) {
        console.log("Absences list sent.");
    } else {
        console.log("Absences list already published.");
    }
}

runJob(main);
