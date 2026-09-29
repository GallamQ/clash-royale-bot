import { verifyKey, InteractionType, InteractionResponseType } from "discord-interactions";
import express from "express";
import { handleAbsence } from "./absenceCommand";

const publicKey = process.env.DISCORD_PUBLIC_KEY;

if (!publicKey) {
    throw new Error("DISCORD_PUBLIC_KEY manquante dans l'environnement !");
}

const app = express();

app.post(
    "/interactions",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        const signature = req.get("x-signature-ed25519");
        const timestamp = req.get("x-signature-timestamp");

        if (!signature || !timestamp) {
            res.status(401).send("Missing signature headers");
            return;
        }

        const isValid = await verifyKey(req.body, signature, timestamp, publicKey);

        if (!isValid) {
            res.status(401).send("Bad request signature");
            return;
        }

        const interaction = JSON.parse(req.body.toString());

        if (interaction.type === InteractionType.PING) {
            res.json({ type: InteractionResponseType.PONG });
            return;
        }

        if (interaction.type === InteractionType.APPLICATION_COMMAND) {
            const options = interaction.data.options ?? [];
            const getOption = (name: string) => options.find((option) => option.name === name)?.value;
            const today = new Date().toISOString().slice(0, 10);
            const content = await handleAbsence(
                {
                    tag: getOption("tag"),
                    debut: getOption("debut"),
                    fin: getOption("fin"),
                    retirer: getOption("retirer")
                },
                today
            );

            res.json({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content }
            });

            return;
        }

        res.status(400).send("Unknown interaction type");
    }
);

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
    console.log(`Serveur d'interactions à l'écoute sur le port ${port}.`);
});