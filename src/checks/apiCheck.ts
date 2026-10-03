import { getClanMembers } from "../api/clashApi";

async function main() {
  const members = await getClanMembers();
  console.log(`${members.length} members received`);
  console.log(members[0]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});