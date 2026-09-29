import { generateKeyPairSync, sign } from "node:crypto";
import { spawn } from "node:child_process";

const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const publicKeyHex = publicKey
    .export({ type: "spki", format: "der" })
    .subarray(-32)
    .toString("hex");

async function post(body: object, tamper = false) {
    const raw = JSON.stringify(body);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = sign(null, Buffer.from(timestamp + raw), privateKey).toString("hex");

    const response = await fetch("http://localhost:3001/interactions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Signature-Ed25519": tamper ? "00".repeat(64) : signature,
            "X-Signature-Timestamp": timestamp,
        },
        body: raw,
    });
    console.log(response.status, await response.text());
}

async function main() {
    const server = spawn(process.execPath, ["--import", "tsx", "src/server/interactions.ts"], {
        env: { ...process.env, DISCORD_PUBLIC_KEY: publicKeyHex, PORT: "3001" },
        stdio: "inherit",
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await post({ type: 1 });        // attendu : 200 {"type":1}
    await post({ type: 1 }, true);  // attendu : 401 (signature falsifiée)
    await post({ type: 2 });        // attendu : 400 (type pas encore géré)

    server.kill();
}

main();