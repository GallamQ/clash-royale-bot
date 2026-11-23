import { isMessagePublished, markMessagePublished } from "../db/publishedMessages";
import type { PublishedMessageKind } from "../db/publishedMessages";

export async function publishOnce(
    kind: PublishedMessageKind,
    referenceDate: string,
    send: () => Promise<void>,
): Promise<boolean> {
    const isDryRun = process.env.DRY_RUN === "1";
    const alreadyPublished = !isDryRun && (await isMessagePublished(kind, referenceDate));

    if (alreadyPublished) {
        return false;
    }

    await send();

    if (!isDryRun) {
        await markMessagePublished(kind, referenceDate);
    }

    return true;
}
