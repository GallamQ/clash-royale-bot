import { CLAN_TAG, fetchFromApi } from "../api/clashApi";
import { writeFileSync } from "fs";

async function main() {
  const data = await fetchFromApi<unknown>(
    `clans/%23${CLAN_TAG}/currentriverrace`
  );

  writeFileSync("riverrace-raw.json", JSON.stringify(data, null, 2));
  console.log("Écrit dans riverrace-raw.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});