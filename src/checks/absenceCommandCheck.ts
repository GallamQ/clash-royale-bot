import { requireTestDatabase } from "./requireTestDatabase";
import { getClanMemberByTag } from "../db/members";
import { getAllAbsences } from "../db/absences";
import { handleAbsence } from "../server/absenceCommand";
import { pool } from "../db/pool";

async function main() {
    requireTestDatabase();

    await pool.query(
        `INSERT INTO clan_members (tag, name, role, join_date)
    VALUES ('#TEST1', 'Test Un', 'member', CURRENT_DATE)
    ON CONFLICT (tag) DO NOTHING;`,
    );

    const today = new Date().toISOString().slice(0, 10);
    const member = await getClanMemberByTag("#TEST1");

    if (!member) {
        throw new Error("Test member #TEST1 not found.");
    }

    console.log("Membre de test :", member.name, member.tag);

    console.log("Absences avant :", await getAllAbsences());

    console.log(await handleAbsence({ tag: member.tag }, today));
    console.log("Après ajout :", await getAllAbsences());

    console.log(
        await handleAbsence({ tag: member.tag, debut: "05-10-2026", fin: "11-10-2026" }, today),
    );

    console.log(await handleAbsence({ tag: member.tag, retirer: true }, today));
    console.log("Après retrait :", await getAllAbsences());

    await pool.query("DELETE FROM clan_members WHERE tag = '#TEST1'");
    await pool.end();
}

main();
