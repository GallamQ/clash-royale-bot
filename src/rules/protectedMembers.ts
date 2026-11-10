export function parseProtectedTags(value: string | undefined): Set<string> {
    if (!value) {
        return new Set();
    }

    const tags = value
        .split(",")
        .map((tag) => tag.trim().toUpperCase())
        .filter((tag) => tag.length > 0);

    return new Set(tags);
}
