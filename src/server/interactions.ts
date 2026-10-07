import { verifyKey, InteractionType, InteractionResponseType } from "discord-interactions";
import express from "express";
import { handleAbsence } from "./absenceCommand";
import { getAllClanMembers } from "../db/members";
import { buildMemberChoices } from "../rules/memberChoices";
import { getClanToday } from "../utils/clanToday";

const publicKey = process.env.DISCORD_PUBLIC_KEY;

if (!publicKey) {
    throw new Error("DISCORD_PUBLIC_KEY is not defined.");
}

const app = express();

app.post("/interactions", express.raw({ type: "application/json" }), async (req, res) => {
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
        const today = getClanToday();
        const content = await handleAbsence(
            {
                tag: getOption("tag"),
                debut: getOption("debut"),
                fin: getOption("fin"),
                retirer: getOption("retirer"),
            },
            today,
        );

        res.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content },
        });

        return;
    }

    if (interaction.type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE) {
        const focused = interaction.data.options.find((option) => option.focused);

        try {
            const members = await getAllClanMembers();
            const choices = buildMemberChoices(members, focused?.value ?? "");

            res.json({
                type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
                data: { choices },
            });
        } catch {
            res.json({
                type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
                data: { choices: [] },
            });
        }

        return;
    }

    res.status(400).send("Unknown interaction type");
});

const port = Number(process.env.PORT ?? 3000);
const host = "127.0.0.1";

app.listen(port, host, () => {
    console.log(`Interactions server listening on ${host}:${port}.`);
});
