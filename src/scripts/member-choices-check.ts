import { buildMemberChoices } from "../rules/memberChoices";

const members = [
    { tag: "#AAA111", name: "Quentin", role: "leader", join_date: "2026-09-22" },
    { tag: "#BBB222", name: "quentin_2", role: "member", join_date: "2026-09-22" },
    { tag: "#CCC333", name: "Alice", role: "elder", join_date: "2026-09-22" },
    { tag: "#DDD444", name: "خير ان شاء الله", role: "member", join_date: "2026-09-22" },
];

console.log("--- Champ vide ---");
console.log(buildMemberChoices(members, ""));

console.log("\n--- 'que' (nom, casse ignorée) ---");
console.log(buildMemberChoices(members, "que"));

console.log("\n--- 'ccc' (recherche par tag) ---");
console.log(buildMemberChoices(members, "ccc"));

console.log("\n--- 'zzz' (aucun résultat) ---");
console.log(buildMemberChoices(members, "zzz"));

console.log("\n--- Plus de 25 membres ---");
const many = Array.from({ length: 40 }, (_, i) => ({
    tag: `#T${i}`, name: `Joueur${i}`, role: "member", join_date: "2026-09-22",
}));
console.log(buildMemberChoices(many, "").length);