import { fetchWithTimeout } from "./fetchWithTimeout";
import { splitMessage } from "./splitMessage";
import { getWebhookEnvName } from "./webhookChannel";
import type { WebhookChannel } from "./webhookChannel";

const DISCORD_MESSAGE_LIMIT = 2000;

async function postChunk(urlEnvName: string, message: string): Promise<void> {
    if (process.env.DRY_RUN === "1") {
        console.log(`[DRY_RUN] ${urlEnvName}`);
        console.log(message);
        return;
    }

    const webhookUrl = process.env[urlEnvName];

    if (!webhookUrl) {
        throw new Error(`${urlEnvName} is not defined.`);
    }

    const response = await fetchWithTimeout(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
    });

    if (!response.ok) {
        throw new Error(
            `Discord webhook request failed: ${response.status} ${response.statusText}`,
        );
    }
}

async function postToWebhook(urlEnvName: string, message: string): Promise<void> {
    for (const chunk of splitMessage(message, DISCORD_MESSAGE_LIMIT)) {
        await postChunk(urlEnvName, chunk);
    }
}

export async function sendWebhookMessage(message: string, channel: WebhookChannel): Promise<void> {
    await postToWebhook(getWebhookEnvName(channel, process.env), message);
}

export async function sendAlertMessage(message: string): Promise<void> {
    await postToWebhook("ALERT_WEBHOOK_URL", message);
}
