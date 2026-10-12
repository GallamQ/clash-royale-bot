import type { War } from "../types/db";
import { pool } from "./pool";

export async function saveWar(war: War): Promise<void> {
    await pool.query(
        `INSERT INTO wars (start_date, start_index, period_type)
        VALUES ($1, $2, $3)
        ON CONFLICT (start_date) DO NOTHING`,
        [war.startDate, war.startIndex, war.periodType],
    );
}

export async function getOpenWar(): Promise<War | null> {
    const result = await pool.query<War>(
        `SELECT start_date AS "startDate", start_index AS "startIndex", period_type AS "periodType"
        FROM wars
        WHERE end_date IS NULL
        ORDER BY start_date
        LIMIT 1;`,
    );

    return result.rows[0] ?? null;
}

export async function closeWar(startDate: string, endDate: string): Promise<void> {
    await pool.query(
        `UPDATE wars
        SET end_date = $2
        WHERE start_date = $1 AND end_date IS NULL;`,
        [startDate, endDate],
    );
}
