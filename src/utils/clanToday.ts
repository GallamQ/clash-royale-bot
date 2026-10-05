export const CLAN_TIME_ZONE = "Europe/Paris";

const clanDateFormatter = new Intl.DateTimeFormat("sv-SE", { timeZone: CLAN_TIME_ZONE });

export function getClanToday(now: Date = new Date()): string {
    return clanDateFormatter.format(now);
}
