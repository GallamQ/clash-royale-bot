import type { JokerLoss } from "../rules/jokerLosses";
import { safeName } from "../utils/safeName";

function formatGroup(header: string, icon: string, losses: JokerLoss[]): string {
    let section = `${header}\n`;

    for (const loss of losses) {
        section += `${icon} ${safeName(loss.member.name)}\n`;
    }

    return section;
}

export function formatJokerLosses(losses: JokerLoss[]): string {
    if (losses.length === 0) {
        return "✅ Aucun joker perdu cette semaine !";
    }

    const noJoker = losses.filter((loss) => loss.jokersLeft === 0);
    const oneJoker = losses.filter((loss) => loss.jokersLeft === 1);
    const twoJokers = losses.filter((loss) => loss.jokersLeft === 2);

    const sections: string[] = [];

    if (noJoker.length > 0) {
        sections.push(
            formatGroup("**Plus aucun joker** (prochain zéro = sanction)", "⚠️", noJoker),
        );
    }

    if (oneJoker.length > 0) {
        sections.push(formatGroup("**1 joker restant**", "🃏", oneJoker));
    }

    if (twoJokers.length > 0) {
        sections.push(formatGroup("**2 jokers restants**", "🃏", twoJokers));
    }

    return `**Suivi des jokers 🃏**\n\n${sections.join("\n")}`;
}
