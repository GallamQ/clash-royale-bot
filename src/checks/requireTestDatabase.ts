export function requireTestDatabase(): void {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not defined.");
    }

    const databaseName = new URL(databaseUrl).pathname.slice(1);

    if (!databaseName.endsWith("_test")) {
        throw new Error(
            `Refusing to run: this check writes data, but DATABASE_URL points to "${databaseName}" instead of a database ending with "_test".`,
        );
    }
}
