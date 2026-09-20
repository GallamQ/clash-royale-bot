import { pool } from "./pool";

export interface ClanMember {
  tag: string;
  name: string;
  role: string;
  join_date: Date;
}

export async function getClanMemberByTag(tag: string): Promise<ClanMember | null> {
    const result = await pool.query("SELECT * FROM clan_members WHERE tag = $1;", [tag]);

    return result.rows[0] ?? null;
}