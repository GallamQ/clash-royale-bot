import { resolveAbsenceDates } from "../rules/absenceDates";

function test(debut: string | undefined, fin: string | undefined, today: string) {
    try {
        console.log(debut, fin, today, "→", resolveAbsenceDates(debut, fin, today));
    } catch (error) {
        console.log(debut, fin, today, "→ erreur :", (error as Error).message);
    }
}

test(undefined, undefined, "2026-09-29");
test(undefined, undefined, "2026-10-04");
test(undefined, undefined, "2026-09-28");

test("05-10-2026", "11-10-2026", "2026-09-29");

test("31-02-2026", "05-03-2026", "2026-09-29");
test("11-10-2026", "05-10-2026", "2026-09-29");
test("2026-10-05", "2026-10-11", "2026-09-29");