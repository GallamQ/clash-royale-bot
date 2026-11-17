export function buildMessagePayload(content: string): {
    content: string;
    allowed_mentions: { parse: string[] };
} {
    return { content, allowed_mentions: { parse: [] } };
}
