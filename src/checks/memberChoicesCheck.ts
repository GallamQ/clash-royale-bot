import { buildMemberChoices } from "../rules/memberChoices";

const members = [
    { tag: "#AAA111", name: "Quentin", role: "leader", joinDate: "2026-09-22" },
    { tag: "#BBB222", name: "quentin_2", role: "member", joinDate: "2026-09-22" },
    { tag: "#CCC333", name: "Alice", role: "elder", joinDate: "2026-09-22" },
    { tag: "#DDD444", name: "خير ان شاء الله", role: "member", joinDate: "2026-09-22" },
];

console.log("--- Empty field ---");
console.log(buildMemberChoices(members, ""));

console.log("\n--- 'que' (name, case ignored) ---");
console.log(buildMemberChoices(members, "que"));

console.log("\n--- 'ccc' (search by tag) ---");
console.log(buildMemberChoices(members, "ccc"));

console.log("\n--- 'zzz' (no result) ---");
console.log(buildMemberChoices(members, "zzz"));

console.log("\n--- More than 25 members ---");
const many = Array.from({ length: 40 }, (_, i) => ({
    tag: `#T${i}`,
    name: `Joueur${i}`,
    role: "member",
    joinDate: "2026-09-22",
}));
console.log(buildMemberChoices(many, "").length);
