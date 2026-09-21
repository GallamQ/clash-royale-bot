import { pool } from "./pool";
import type { ApiMember } from "../api/types";

export interface ClanMember {
  tag: string;
  name: string;
  role: string;
  join_date: Date;
}

export async function getClanMemberByTag(tag: string): Promise<ClanMember | null> {
    const result = await pool.query<ClanMember>("SELECT * FROM clan_members WHERE tag = $1;", [tag]);

    return result.rows[0] ?? null;
}

export async function getAllClanMembers(): Promise<ClanMember[]> {
  const result = await pool.query<ClanMember>("SELECT * FROM clan_members;");

  return result.rows;
}

export async function getAllClanTags(): Promise<Set<string>> {
  const result = await pool.query<{ tag: string }>("SELECT tag FROM clan_members;");
  const rows = result.rows;
  const tags = rows.map(row => row.tag);
  const uniqueTags = new Set(tags);

  return uniqueTags;
}

export async function syncClanMembers(members: ApiMember[]): Promise<void> {
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
          VALUES ($1, $2, $3, CURRENT_DATE)
          ON CONFLICT (tag) DO UPDATE
          SET name = EXCLUDED.name, role = EXCLUDED.role`,
          [member.tag, member.name, member.role]
        );
      }

      await client.query(
        `DELETE FROM absences
        WHERE tag IN (SELECT tag FROM clan_members WHERE tag <> ALL($1::varchar[]));`,
        [apiTags]
      );

      await client.query(
        "DELETE FROM clan_members WHERE tag <> ALL($1::varchar[]);",
        [apiTags]
      );

      await client.query("COMMIT");

    } catch (error) {
      await client.query("ROLLBACK");
      throw error;

    } finally {
      client.release();
    }
}
