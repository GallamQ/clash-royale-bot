import { pool } from "./pool";

export interface Absence {
    tag: string;
    start_date: string;
    end_date: string;
}

export interface AbsenceWithName extends Absence {
    name: string;
}

export async function addAbsence(tag: string, startDate: string, endDate: string): Promise<void> {
    await pool.query(
        `INSERT INTO absences (tag, start_date, end_date) VALUES ($1, $2, $3);`,
        [tag, startDate, endDate]
    );
}

export async function removeAbsencesByTag(tag: string): Promise<void> {
    await pool.query(
        `DELETE FROM absences
        WHERE tag = $1;`,
        [tag]
    );
}

export async function deleteExpiredAbsences(): Promise<void> {
    await pool.query(
        `DELETE FROM absences
         WHERE end_date < CURRENT_DATE;`
    );
}

export async function getAllAbsences(): Promise<AbsenceWithName[]> {
    const result = await pool.query<AbsenceWithName>(
        `SELECT a.tag, a.start_date, a.end_date, cm.name
        FROM absences a
        JOIN clan_members cm ON a.tag = cm.tag
        ORDER BY a.start_date, cm.name;`
    );
    
    return result.rows;
}

export async function getActiveAbsences(): Promise<AbsenceWithName[]> {
    const result = await pool.query<AbsenceWithName>(
        `SELECT a.tag, a.start_date, a.end_date, cm.name
        FROM absences a
        JOIN clan_members cm ON a.tag = cm.tag
        WHERE a.start_date <= CURRENT_DATE AND a.end_date >= CURRENT_DATE
        ORDER BY cm.name;`
    );
    
    return result.rows;
}