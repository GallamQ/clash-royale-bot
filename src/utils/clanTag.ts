export function normalizeClanTag(rawTag: string): string {
    return `#${rawTag.trim().replace(/^#/, "")}`;
}

export function getClanEndpoint(clanTag: string): string {
    return `clans/${encodeURIComponent(clanTag)}`;
}
