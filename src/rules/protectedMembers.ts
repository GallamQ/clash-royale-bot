import type { JokerState } from "./jokers";

export function parseProtectedTags(value: string | undefined): Set<string> {
    if (!value) {
        return new Set();
    }

    const tags = value
        .split(",")
        .map((tag) => tag.trim().toUpperCase())
        .filter((tag) => tag.length > 0);

    return new Set(tags);
}

export function removeProtectedStates(
    states: Map<string, JokerState>,
    protectedTags: Set<string>,
): Map<string, JokerState> {
    const result = new Map<string, JokerState>();

    for (const [tag, state] of states) {
        if (!protectedTags.has(tag)) {
            result.set(tag, state);
        }
    }

    return result;
}
