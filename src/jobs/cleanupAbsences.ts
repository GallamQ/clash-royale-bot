import { deleteExpiredAbsences, getAllAbsences } from "../db/absences";
import { formatAbsencesList } from "../messages/absencesList";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { runJob } from "./runJob";

async function main() {
    console.log("Deleting expired absences...");

    await deleteExpiredAbsences();

    console.log("Expired absences deleted.");

    const updatedAbsencesList = await getAllAbsences();
    const message = formatAbsencesList(updatedAbsencesList);

    await sendWebhookMessage(message);

    console.log("Absences list sent.");
}

runJob(main);
