import type { WarResult } from "./warResults";
import { getTopScores } from "./podium";

export const MEMBER_JOKERS = 3;
export const ELDER_JOKERS = 1;
export const RECOVERY_STREAK = 4;

export type WarHistoryEntry = {
    startDate: string;
    results: WarResult[];
};

export type JokerOutcome = "played" | "neutral" | "jokerUsed" | "kick" | "demote" | "notConcerned";

export type JokerState = {
    role: string;
    jokers: number;
    streak: number;
    outcome: JokerOutcome;
};

function getAllocation(role: string): number {
    if (role === "member") {
        return MEMBER_JOKERS;
    } else if (role === "elder") {
        return ELDER_JOKERS;
    } else {
        return 0;
    }
}

function applyWar(
    previous: JokerState | undefined,
    result: WarResult,
    isTopThree: boolean,
): JokerState {
    const role = result.role;
    const current = previous && previous.role === role ? previous : undefined;
    const jokers = current?.jokers ?? getAllocation(role);
    const streak = current?.streak ?? 0;

    if (role !== "member" && role !== "elder") {
        return { role, jokers: 0, streak: 0, outcome: "notConcerned" };
    }

    if (result.exempt) {
        return { role, jokers, streak, outcome: "neutral" };
    }

    if (result.fame === 0) {
        if (jokers > 0) {
            return { role, jokers: jokers - 1, streak: 0, outcome: "jokerUsed" };
        } else {
            const outcome: JokerOutcome = role === "member" ? "kick" : "demote";

            return { role, jokers: 0, streak: 0, outcome };
        }
    }

    if (role === "elder") {
        return { role, jokers: isTopThree ? ELDER_JOKERS : jokers, streak: 0, outcome: "played" };
    }

    const newStreak = streak + 1;

    if (newStreak === RECOVERY_STREAK) {
        return {
            role,
            jokers: Math.min(jokers + 1, MEMBER_JOKERS),
            streak: 0,
            outcome: "played",
        };
    }

    return { role, jokers, streak: newStreak, outcome: "played" };
}

export function replayJokers(wars: WarHistoryEntry[]): Map<string, JokerState> {
    const states = new Map<string, JokerState>();

    for (const war of wars) {
        const topScores = getTopScores(war.results);

        for (const result of war.results) {
            const previous = states.get(result.tag);
            const isTopThree = topScores.includes(result.fame);

            states.set(result.tag, applyWar(previous, result, isTopThree));
        }
    }

    const lastWar = wars[wars.length - 1];

    if (!lastWar) {
        return states;
    }

    const lastTags = new Set(lastWar.results.map((result) => result.tag));

    for (const tag of states.keys()) {
        if (!lastTags.has(tag)) {
            states.delete(tag);
        }
    }

    return states;
}
