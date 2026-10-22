import { pool } from "./pool";
import type { ApiMember } from "../types/api";
import type { ClanMember } from "../types/db";

const MEMBER_COLUMNS = `tag, name, role, join_date AS "joinDate"`;

export async function getClanMemberByTag(tag: string): Promise<ClanMember | null> {
    const result = await pool.query<ClanMember>(
        `SELECT ${MEMBER_COLUMNS} FROM clan_members WHERE tag = $1 AND left_at IS NULL;`,
        [tag],
    );

    return result.rows[0] ?? null;
}

export async function getAllClanMembers(): Promise<ClanMember[]> {
    const result = await pool.query<ClanMember>(
        `SELECT ${MEMBER_COLUMNS} FROM clan_members WHERE left_at IS NULL;`,
    );

    return result.rows;
}

export async function getAllClanTags(): Promise<Set<string>> {
    const result = await pool.query<{ tag: string }>(
        "SELECT tag FROM clan_members WHERE left_at IS NULL;",
    );
    const rows = result.rows;
    const tags = rows.map((row) => row.tag);
    const uniqueTags = new Set(tags);

    return uniqueTags;
}

export async function syncClanMembers(members: ApiMember[], today: string): Promise<void> {
    if (members.length === 0) {
        throw new Error("syncClanMembers received an empty list, aborting.");
    }

    const apiTags = members.map((member) => member.tag);
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (const member of members) {
            await client.query(
                `INSERT INTO clan_members (tag, name, role, join_date)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (tag) DO UPDATE
                SET name = EXCLUDED.name, role = EXCLUDED.role, left_at = NULL`,
                [member.tag, member.name, member.role, today],
            );
        }

        const vanished = await client.query<{ tag: string }>(
            `SELECT tag
            FROM clan_members
            WHERE left_at IS NULL
                AND tag <> ALL ($1::varchar[])
                AND NOT EXISTS (SELECT 1 FROM war_results WHERE war_results.tag = clan_members.tag)
                AND NOT EXISTS (SELECT 1 FROM war_logs WHERE war_logs.tag = clan_members.tag);`,
            [apiTags],
        );
        const vanishedTags = vanished.rows.map((row) => row.tag);

        await client.query("DELETE FROM absences WHERE tag = ANY($1);", [vanishedTags]);
        await client.query("DELETE FROM clan_members WHERE tag = ANY($1);", [vanishedTags]);

        await client.query(
            `UPDATE clan_members
            SET left_at = $1
            WHERE left_at IS NULL
                AND tag <> ALL ($2::varchar[]);`,
            [today, apiTags],
        );

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function purgeDepartedMembers(cutoffDate: string): Promise<string[]> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const departed = await client.query<{ tag: string }>(
            `SELECT tag
            FROM clan_members
            WHERE left_at < $1;`,
            [cutoffDate],
        );
        const departedTags = departed.rows.map((row) => row.tag);

        await client.query(
            `DELETE FROM absences
            WHERE tag = ANY($1);`,
            [departedTags],
        );

        await client.query(
            `DELETE FROM war_logs
            WHERE tag = ANY($1);`,
            [departedTags],
        );

        await client.query(
            `DELETE FROM war_results
            WHERE tag = ANY($1);`,
            [departedTags],
        );

        await client.query(
            `DELETE FROM clan_members
            WHERE tag = ANY($1);`,
            [departedTags],
        );

        await client.query("COMMIT");

        return departedTags;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
