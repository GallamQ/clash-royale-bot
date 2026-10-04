import { CLAN_ENDPOINT, fetchFromApi } from "../api/clashApi";
import { writeFileSync } from "fs";

async function main() {
    const data = await fetchFromApi<unknown>(`${CLAN_ENDPOINT}/currentriverrace`);

    writeFileSync("riverrace-raw.json", JSON.stringify(data, null, 2));
    console.log("Written to riverrace-raw.json");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
