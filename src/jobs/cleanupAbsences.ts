import { deleteExpiredAbsences } from "../db/absences";

async function main() {
    console.log("Suppression des absences expirées des membres du clan en cours...");

    await deleteExpiredAbsences();

    console.log("Suppression des absences expirées terminée !");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
