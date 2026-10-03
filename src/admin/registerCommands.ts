const appId = process.env.DISCORD_APP_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const token = process.env.DISCORD_BOT_TOKEN;

if (!appId || !guildId || !token) {
    throw new Error("DISCORD_APP_ID, DISCORD_GUILD_ID et DISCORD_BOT_TOKEN sont requis");
}

const commands = [
    {
        name: "absence-test",
        description: "Déclarer ou retirer une absence",
        type: 1,
        options: [
            {
                type: 3,
                name: "tag",
                description: "Tag du joueur (ex. #ABC123)",
                required: true,
                autocomplete: true,
            },
            {
                type: 3,
                name: "debut",
                description: "Début (JJ-MM-AAAA), par défaut le lundi de cette semaine",
                required: false,
            },
            {
                type: 3,
                name: "fin",
                description: "Fin (JJ-MM-AAAA), par défaut le dimanche de cette semaine",
                required: false,
            },
            {
                type: 5,
                name: "retirer",
                description: "Supprimer toutes les absences de ce joueur",
                required: false,
            },
        ],
    },
];

async function main() {
    const response = await fetch(
        `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bot ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(commands),
        },
    );

    if (!response.ok) {
        console.error(response.status, await response.text());
        process.exit(1);
    }

    const registered = (await response.json()) as unknown[];
    console.log(`${registered.length} commande(s) enregistrée(s).`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
