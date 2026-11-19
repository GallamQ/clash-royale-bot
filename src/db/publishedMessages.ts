import { pool } from "./pool";

export type PublishedMessageKind = "podium" | "kickList" | "jokerLosses" | "absences";

export async function isMessagePublished(
    kind: PublishedMessageKind,
    referenceDate: string,
): Promise<boolean> {
    const result = await pool.query(
        `SELECT 1
        FROM published_messages
        WHERE kind = $1 AND reference_date = $2;`,
        [kind, referenceDate],
    );

    return result.rowCount === 1;
}

export async function markMessagePublished(
    kind: PublishedMessageKind,
    referenceDate: string,
): Promise<void> {
    await pool.query(
        `INSERT INTO published_messages (kind, reference_date)
        VALUES ($1, $2)
        ON CONFLICT (kind, reference_date) DO NOTHING;`,
        [kind, referenceDate],
    );
}
