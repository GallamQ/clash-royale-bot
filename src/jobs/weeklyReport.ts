import { getLatestWarLogs } from "../db/warLogs";
import { getAllClanMembers } from "../db/members";

async function main() {
  console.log("Génération du rapport hebdomadaire en cours...");

  const warLogs = await getLatestWarLogs();

  if (!warLogs.length) {
    console.log("Aucune donnée de guerre trouvée !");
    return;
  }

  const clanMembers = await getAllClanMembers();
  const clanMembersMap = new Map(clanMembers.map((member) => [member.tag, member]));

  console.log("Rapport généré !");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});