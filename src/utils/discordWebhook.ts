export async function sendWebhookMessage(message: string): Promise<void> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
    throw new Error("DISCORD_WEBHOOK_URL is not defined.");
    }

    const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message })
    });

    if (!response.ok) {
    throw new Error(`Discord webhook request failed: ${response.status} ${response.statusText}`);
    }
}