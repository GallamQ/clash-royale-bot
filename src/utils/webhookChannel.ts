export type WebhookChannel = "podium" | "kickList" | "jokerLosses" | "absences";

const DEFAULT_WEBHOOK_ENV_NAME = "DISCORD_WEBHOOK_URL";

const WEBHOOK_ENV_NAMES: Record<WebhookChannel, string> = {
    podium: "PODIUM_WEBHOOK_URL",
    kickList: "KICK_LIST_WEBHOOK_URL",
    jokerLosses: "JOKER_LOSSES_WEBHOOK_URL",
    absences: "ABSENCES_WEBHOOK_URL",
};

export function getWebhookEnvName(
    channel: WebhookChannel,
    env: Record<string, string | undefined>,
): string {
    const dedicatedName = WEBHOOK_ENV_NAMES[channel];

    if (env[dedicatedName]) {
        return dedicatedName;
    }

    return DEFAULT_WEBHOOK_ENV_NAME;
}
