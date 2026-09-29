import { getAllClanMembers } from "../db/members";
import { getAllAbsences } from "../db/absences";
import { handleAbsence } from "../server/absenceCommand";
import { pool } from "../db/pool";

async function main() {
    const today = new Date().toISOString().slice(0, 10);
    const [member] = await getAllClanMembers();
    console.log("Membre de test :", member.name, member.tag);

    console.log("Absences avant :", await getAllAbsences());

    console.log(await handleAbsence({ tag: member.tag }, today));
    console.log("Après ajout :", await getAllAbsences());

    console.log(await handleAbsence({ tag: member.tag, debut: "2026-10-05", fin: "2026-10-11" }, today));

    console.log(await handleAbsence({ tag: member.tag, retirer: true }, today));
    console.log("Après retrait :", await getAllAbsences());

    await pool.end();
}

main();