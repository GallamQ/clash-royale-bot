import { syncClanMembers, getAllClanMembers } from "../db/members";
import { pool } from "../db/pool";

async function main() {
  console.log("--- Before ---");
  console.table(await getAllClanMembers());

  await syncClanMembers([
    { tag: "#TEST1", name: "Test Un Renamed", role: "elder" },
    { tag: "#TEST3", name: "Test Trois", role: "member" },
  ]);

  console.log("--- After ---");
  console.table(await getAllClanMembers());

  const absences = await pool.query("SELECT * FROM absences WHERE tag LIKE '#TEST%'");
  console.log("Remaining test absences:", absences.rows);

  try {
    await syncClanMembers([]);
    console.log("PROBLEM: an empty list was accepted");
  } catch (error) {
    console.log("Empty list rejected as expected:", (error as Error).message);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});