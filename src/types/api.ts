export interface ApiMember {
    tag: string;
    name: string;
    role: string;
}

export interface WarParticipant {
    tag: string;
    fame: number;
}

export interface PeriodLogItem {
    clan: { tag: string };
    pointsEarned: number;
    progressStartOfDay: number;
    progressEndOfDay: number;
    endOfDayRank: number;
}

export interface PeriodLog {
    items: PeriodLogItem[];
    periodIndex: number;
}

export interface ClanWarData {
    participants: WarParticipant[];
    periodType: string;
    state: string;
    clanFame: number;
    periodLogs: PeriodLog[];
    periodIndex: number;
}
