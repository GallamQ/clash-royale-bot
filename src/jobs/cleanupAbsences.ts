import { deleteExpiredAbsences, getAllAbsences } from "../db/absences";
import { formatAbsencesList } from "../messages/absencesList";
import { getClanToday } from "../utils/clanToday";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { runJob } from "./runJob";

async function main() {
    console.log("Deleting expired absences...");

    const today = getClanToday();

    await deleteExpiredAbsences(today);

    console.log("Expired absences deleted.");

    const updatedAbsencesList = await getAllAbsences();
    const message = formatAbsencesList(updatedAbsencesList);

    await sendWebhookMessage(message);

    console.log("Absences list sent.");
}

runJob(main);
