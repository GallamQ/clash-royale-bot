import type { PodiumStep } from "../rules/podium";
import type { ClanMember } from "../types/db";
import { safeName } from "../utils/safeName";

const ROLE_LABELS: Record<string, string> = {
    member: "Membre",
    elder: "Aîné",
    coLeader: "Chef adjoint",
    leader: "Chef",
};

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
    const lines = step.players.map((player) => `      ◦ ${formatPlayer(player, step.fame)}`);

    return `${title}\n${lines.join("\n")}\n\n`;
}

export function formatPodium(warId: string, podium: PodiumStep[]): string {
    const header = `⚔️   Top 3 de la semaine   🗓   ${warId}   ⚔️\n\n`;
    const podiumText = podium.map(formatStep).join("");

    return header + podiumText;
}
