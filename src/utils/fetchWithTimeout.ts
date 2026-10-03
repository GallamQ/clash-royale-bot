const NETWORK_TIMEOUT_MS = 10_000;

export function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
    return fetch(url, { ...init, signal: AbortSignal.timeout(NETWORK_TIMEOUT_MS) });
}
