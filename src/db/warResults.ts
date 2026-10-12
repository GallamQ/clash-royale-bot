import type { WarResult } from "../rules/warResults";
import { pool } from "./pool";

export async function saveWarResults(warStartDate: string, results: WarResult[]): Promise<void> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (const result of results) {
            await client.query(
                `INSERT INTO war_results (war_start_date, tag, fame, exempt, role)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (war_start_date, tag) DO NOTHING`,
                [warStartDate, result.tag, result.fame, result.exempt, result.role],
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
