import type { War, WarLogEntry, WarLogRow } from "../types/db";
import { pool } from "./pool";

export async function saveWarLogs(
    war: War,
    warDate: string,
    participants: WarLogEntry[],
    knownTags: Set<string>,
): Promise<void> {
    const warId = war.startIndex.toString();
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (const participant of participants) {
            if (!knownTags.has(participant.tag)) {
                continue;
            }

            await client.query(
                `INSERT INTO war_logs (war_id, war_start_date, war_date, tag, fame)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (war_start_date, tag) DO UPDATE
                SET fame = EXCLUDED.fame, war_date = EXCLUDED.war_date`,
                [warId, war.startDate, warDate, participant.tag, participant.fame],
            );
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function getWarLogsByStartDate(startDate: string): Promise<WarLogRow[]> {
    const result = await pool.query<WarLogRow>(
        `SELECT id, tag, fame
        FROM war_logs
        WHERE war_start_date = $1
        ORDER BY fame DESC;`,
        [startDate],
    );

    return result.rows;
}
