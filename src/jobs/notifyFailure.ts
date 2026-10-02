import { sendAlertMessage } from "../utils/discordWebhook";

async function main() {
    const unitName = process.argv[2];

    if (!unitName) {
        throw new Error("Missing unit name argument.");
    }

    const message = `⚠️ **Échec d'un job du bot** : \`${unitName}\`\nDétails : \`journalctl -u ${unitName} -n 30 --no-pager\``;

    await sendAlertMessage(message);

    console.log("Alerte envoyée !");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});