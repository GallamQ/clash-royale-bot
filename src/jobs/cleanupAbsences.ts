import { deleteExpiredAbsences, getAllAbsences } from "../db/absences";
import { formatAbsencesList } from "../rules/absencesList";
import { sendWebhookMessage } from "../utils/discordWebhook";
import { runJob } from "./runJob";

async function main() {
    console.log("Suppression des absences expirées des membres du clan en cours...");

    await deleteExpiredAbsences();

    console.log("Suppression des absences expirées terminée !");

    const updatedAbsencesList = await getAllAbsences();
    const message = formatAbsencesList(updatedAbsencesList);

    await sendWebhookMessage(message);

    console.log("Liste des absents envoyée !");
}

runJob(main);
