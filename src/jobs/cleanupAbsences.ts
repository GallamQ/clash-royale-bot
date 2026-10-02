import { deleteExpiredAbsences, getAllAbsences } from "../db/absences";
import { formatAbsencesList } from "../rules/absencesList";
import { sendWebhookMessage } from "../utils/discordWebhook";

async function main() {
    console.log("Suppression des absences expirées des membres du clan en cours...");

    await deleteExpiredAbsences();
    
    console.log("Suppression des absences expirées terminée !");

    const updatedAbsencesList = await getAllAbsences();
    const message = formatAbsencesList(updatedAbsencesList);

    await sendWebhookMessage(message);

    console.log("Liste des absents envoyée !");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
