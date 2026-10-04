import { formatAbsencesList } from "../messages/absencesList";

console.log("--- Cas 1 : liste vide ---");
console.log(formatAbsencesList([]));

console.log("\n--- Cas 2 : une absence ---");
console.log(
    formatAbsencesList([
        { tag: "#AAA", name: "Quentin", start_date: "2026-09-28", end_date: "2026-10-04" },
    ]),
);

console.log("\n--- Cas 3 : pseudo arabe ---");
console.log(
    formatAbsencesList([
        { tag: "#BBB", name: "خير ان شاء الله", start_date: "2026-10-01", end_date: "2026-10-07" },
        { tag: "#CCC", name: "Alice", start_date: "2026-09-30", end_date: "2026-10-02" },
    ]),
);
