export function splitMessage(message: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let currentLines: string[] = [];

    for (const line of message.split("\n")) {
        if (line.length > maxLength) {
            throw new Error(`A line is longer than ${maxLength} characters.`);
        }

        const candidate = [...currentLines, line].join("\n");

        if (candidate.length > maxLength) {
            chunks.push(currentLines.join("\n"));
            currentLines = [line];
        } else {
            currentLines.push(line);
        }
    }

    chunks.push(currentLines.join("\n"));

    return chunks;
}
