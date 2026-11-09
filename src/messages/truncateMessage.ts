export function truncateMessage(message: string, maxLength: number): string {
    if (message.length <= maxLength) {
        return message;
    }

    const lines = message.trimEnd().split("\n");
    let hiddenCount = 0;
    let text = message;

    while (text.length > maxLength && lines.length > 0) {
        lines.pop();
        hiddenCount++;

        const word = hiddenCount === 1 ? "autre" : "autres";

        text = `${lines.join("\n")}\n… et ${hiddenCount} ${word}`;
    }

    return text;
}
