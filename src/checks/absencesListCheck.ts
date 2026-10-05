import { formatAbsencesList } from "../messages/absencesList";

console.log("--- Case 1: empty list ---");
console.log(formatAbsencesList([]));

console.log("\n--- Case 2: one absence ---");
console.log(
    formatAbsencesList([
        { tag: "#AAA", name: "Quentin", startDate: "2026-09-28", endDate: "2026-10-04" },
    ]),
);

console.log("\n--- Case 3: Arabic name ---");
console.log(
    formatAbsencesList([
        { tag: "#BBB", name: "خير ان شاء الله", startDate: "2026-10-01", endDate: "2026-10-07" },
        { tag: "#CCC", name: "Alice", startDate: "2026-09-30", endDate: "2026-10-02" },
    ]),
);
