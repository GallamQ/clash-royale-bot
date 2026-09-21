import { getAllClanMembers, getAllClanTags, getClanMemberByTag } from "../db/members";
import { pool } from "../db/pool";

async function main() {
  const info = await pool.query("SELECT now() AS now, current_user AS user");
  console.log(info.rows[0]);

  const count = await pool.query("SELECT count(*) FROM clan_members");
  console.log(count.rows[0]);

  console.log(await getAllClanMembers());
  console.log(await getAllClanTags());
  console.log(await getClanMemberByTag("#TEST"));
  

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
