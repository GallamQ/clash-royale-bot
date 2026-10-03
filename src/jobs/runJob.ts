import { pool } from "../db/pool";

export async function runJob(job: () => Promise<void>) {
    try {
        await job();
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}