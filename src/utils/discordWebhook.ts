import { fetchWithTimeout } from "./fetchWithTimeout";

async function postToWebhook(urlEnvName: string, message: string): Promise<void> {
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

export async function sendWebhookMessage(message: string): Promise<void> {
    await postToWebhook("DISCORD_WEBHOOK_URL", message);
}

export async function sendAlertMessage(message: string): Promise<void> {
    await postToWebhook("ALERT_WEBHOOK_URL", message);
}
