import { execFile } from "node:child_process";
import { sendAlertMessage } from "../utils/discordWebhook";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const MAX_LOG_LENGTH = 1500;
const LOG_LINES_COUNT = 15;

async function readRecentLogs(unitName: string): Promise<string> {
    try {
        const { stdout } = await execFileAsync("journalctl", ["-u", unitName, "-n", String(LOG_LINES_COUNT), "--no-pager", "-o", "cat"]);

        return stdout.trim().slice(-MAX_LOG_LENGTH);
    } catch {
        return "";
    }
}

async function main() {
    const unitName = process.argv[2];

    if (!unitName) {
        throw new Error("Missing unit name argument.");
    }

    const logs = await readRecentLogs(unitName);
    const details = logs
    ? `Dernières lignes du journal :\n\`\`\`\n${logs}\n\`\`\``
    : `Journal indisponible : \`journalctl -u ${unitName} -n 30 --no-pager\``;
    const message = `⚠️ **Échec d'un job du bot** : \`${unitName}\`\n${details}`;

    await sendAlertMessage(message);

    console.log("Alerte envoyée !");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});