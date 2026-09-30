import { getLatestWarLogs } from "../db/warLogs";
import { type ClanMember, getAllClanMembers } from "../db/members";
import { type PodiumStep, buildPodium } from "../rules/podium";
import { safeName } from "../utils/safeName";

const ROLE_LABELS: Record<string, string> = {
  member: "Membre",
  elder: "Aîné",
  coLeader: "Chef adjoint",
  leader: "Chef"
}

const MEDALS = [":first_place:", ":second_place:", ":third_place:"];

function formatPlayer(member: ClanMember, fame: number): string {
  const roleLabel = ROLE_LABELS[member.role] ?? "Inconnu";
  const promotionNote = member.role === "member" ? " ▫️ **Promotion ❗️**" : "";

  return `${safeName(member.name)} ▫️ ${fame} points ▫️ ${roleLabel}${promotionNote}`;
}

function formatStep(step: PodiumStep): string {
  const medal = MEDALS[step.place - 1];

  if (step.players.length === 1) {
    return `${medal} ${formatPlayer(step.players[0], step.fame)}\n\n`;
  }

  const title = `${medal} **Égalité (${step.players.length} joueurs) :**`;
  const lines = step.players.map(
    (player) => `      ◦ ${formatPlayer(player, step.fame)}`
  );

  return `${title}\n${lines.join("\n")}\n\n`;
}

async function sendReport(message: string): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("DISCORD_WEBHOOK_URL is not defined.");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message })
  });

  if (!response.ok) {
    throw new Error(`Discord webhook request failed: ${response.status} ${response.statusText}`);
  }
}

async function main() {
  console.log("Génération du rapport hebdomadaire en cours...");

  const warLogs = await getLatestWarLogs();

  if (!warLogs.length) {
    console.log("Aucune donnée de guerre trouvée !");
    return;
  }

  const clanMembers = await getAllClanMembers();
  const clanMembersMap = new Map(clanMembers.map((member) => [member.tag, member]));
  const podium = buildPodium(warLogs, clanMembersMap);
  const header = `⚔️   Top 3 de la semaine   🗓   ${warLogs[0].war_id}   ⚔️\n\n`;
  const podiumText = podium.map(formatStep).join("");
  const message = header + podiumText;

  await sendReport(message);

  console.log("Rapport envoyé !");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});