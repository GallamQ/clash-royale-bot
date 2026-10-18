import { deepStrictEqual } from "node:assert/strict";
import { requireTestDatabase } from "./requireTestDatabase";
import { getAllAbsences, removeAbsencesByTag } from "../db/absences";
import { pool } from "../db/pool";
import { handleAbsence } from "../server/absenceCommand";
import { getClanToday } from "../utils/clanToday";
import { safeName } from "../utils/safeName";

const TAG = "#TEST1";
const NAME = safeName("Test Un");

let failures = 0;

function expectEqual(label: string, actual: unknown, expected: unknown) {
    try {
        deepStrictEqual(actual, expected);
        console.log(`OK   ${label}`);
    } catch {
        failures += 1;
        console.log(`FAIL ${label}`);
        console.log("  expected:", expected);
        console.log("  actual:  ", actual);
    }
}

function firstLine(reply: string): string {
    return reply.split("\n")[0];
}

async function countTestAbsences(): Promise<number> {
    const absences = await getAllAbsences();

    return absences.filter((absence) => absence.tag === TAG).length;
}

async function main() {
    requireTestDatabase();

    const today = getClanToday();

    await pool.query(
        `INSERT INTO clan_members (tag, name, role, join_date)
        VALUES ($1, 'Test Un', 'member', $2)
        ON CONFLICT (tag) DO NOTHING;`,
        [TAG, today],
    );

    await removeAbsencesByTag(TAG);

    const period = { tag: TAG, debut: "05-10-2090", fin: "11-10-2090" };

    expectEqual(
        "adding an absence",
        firstLine(await handleAbsence(period, today)),
        `Le joueur \`${NAME}\` a été marqué absent du 05-10-2090 au 11-10-2090.`,
    );
    expectEqual("the absence is stored", await countTestAbsences(), 1);

    expectEqual(
        "adding the same absence again",
        firstLine(await handleAbsence(period, today)),
        `Absence déjà enregistrée pour le joueur \`${NAME}\` du 05-10-2090 au 11-10-2090.`,
    );
    expectEqual("the duplicate is not stored", await countTestAbsences(), 1);

    expectEqual(
        "end date before start date",
        firstLine(
            await handleAbsence({ ...period, debut: "11-10-2090", fin: "05-10-2090" }, today),
        ),
        "Une erreur est survenue : La date de fin est antérieure à la date de début.",
    );

    await handleAbsence({ tag: TAG }, today);

    expectEqual("absence of the current week is stored", await countTestAbsences(), 2);

    expectEqual(
        "unknown tag",
        firstLine(await handleAbsence({ tag: "#NOPE" }, today)),
        "Aucun membre avec le tag `#NOPE` trouvé dans le clan !",
    );

    expectEqual(
        "removing absences",
        firstLine(await handleAbsence({ tag: TAG, retirer: true }, today)),
        `Toutes les absences du joueur \`${NAME}\` ont été supprimées !`,
    );
    expectEqual("the absences are removed", await countTestAbsences(), 0);

    await pool.query("DELETE FROM clan_members WHERE tag = $1", [TAG]);
    await pool.end();

    if (failures > 0) {
        console.log(`${failures} check(s) failed.`);
        process.exit(1);
    }

    console.log("All checks passed.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
