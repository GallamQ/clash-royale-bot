import { saveWarLogs, getLatestWarLogs, getWarLogsByWarId } from "../db/warLogs";
import { pool } from "../db/pool";

async function main() {
  await pool.query(
    `INSERT INTO clan_members (tag, name, role, join_date)
     VALUES ('#TEST1', 'Test Un', 'member', CURRENT_DATE)
     ON CONFLICT (tag) DO NOTHING;`
  );

  await pool.query("DELETE FROM war_logs WHERE war_id LIKE 'TEST-%'");

  await saveWarLogs("TEST-WAR-1", "2026-09-10", [
    { tag: "#TEST1", fame: 1600 },
  ]);

  await saveWarLogs("TEST-WAR-2", "2026-09-17", [
    { tag: "#TEST1", fame: 2200 },
  ]);

  console.log("--- getWarLogsByWarId('TEST-WAR-1') (expected: fame 1600) ---");
  console.table(await getWarLogsByWarId("TEST-WAR-1"));

  console.log("--- getLatestWarLogs() (expected: TEST-WAR-2, fame 2200) ---");
  console.table(await getLatestWarLogs());

  await saveWarLogs("TEST-WAR-2", "2026-09-18", [
    { tag: "#TEST1", fame: 2500 },
  ]);

  console.log("--- getWarLogsByWarId('TEST-WAR-2') après mise à jour (expected: 1 ligne, fame 2500) ---");
  console.table(await getWarLogsByWarId("TEST-WAR-2"));

  await pool.query("DELETE FROM war_logs WHERE war_id LIKE 'TEST-%'");
  await pool.query("DELETE FROM clan_members WHERE tag = '#TEST1'");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});