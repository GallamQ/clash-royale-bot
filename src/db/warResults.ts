import type { WarResult } from "../rules/warResults";
import { pool } from "./pool";

export interface FrozenWar {
    startDate: string;
    results: WarResult[];
}

export async function getLatestFrozenWar(): Promise<FrozenWar | null> {
    const latest = await pool.query<{ startDate: string }>(
        `SELECT war_start_date AS "startDate"
        FROM war_results
        ORDER BY war_start_date DESC
        LIMIT 1;`,
    );

    if (!latest.rows[0]) {
        return null;
    }

    const startDate = latest.rows[0].startDate;
    const rows = await pool.query<WarResult>(
        `SELECT tag, fame, exempt, role
        FROM war_results
        WHERE war_start_date = $1
        ORDER BY fame DESC;`,
        [startDate],
    );

    return { startDate, results: rows.rows };
}

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

export async function getFrozenWars(): Promise<FrozenWar[]> {
    const result = await pool.query<WarResult & { startDate: string }>(
        `SELECT war_start_date AS "startDate", tag, fame, exempt, role
        FROM war_results
        ORDER BY war_start_date ASC, fame DESC;`,
    );

    const wars: FrozenWar[] = [];

    for (const row of result.rows) {
        const warResult = { tag: row.tag, fame: row.fame, exempt: row.exempt, role: row.role };
        const lastWar = wars[wars.length - 1];

        if (lastWar && lastWar.startDate === row.startDate) {
            lastWar.results.push(warResult);
        } else {
            wars.push({ startDate: row.startDate, results: [warResult] });
        }
    }

    return wars;
}
