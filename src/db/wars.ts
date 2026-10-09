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
