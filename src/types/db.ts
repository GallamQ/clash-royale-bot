export interface ClanMember {
    tag: string;
    name: string;
    role: string;
    join_date: string;
}

export interface Absence {
    tag: string;
    startDate: string;
    endDate: string;
}

export interface AbsenceWithName extends Absence {
    name: string;
}

export interface WarLogEntry {
    tag: string;
    fame: number;
}

export interface WarLogRow {
    id: number;
    war_id: string;
    war_date: string;
    tag: string | null;
    fame: number;
}
