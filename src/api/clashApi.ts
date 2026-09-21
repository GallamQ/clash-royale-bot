import { ApiMember } from "./types";

const BASE_URL = "https://api.clashroyale.com/v1";

function requireEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`${name} is not defined.`);
    }

    return value;
}

const API_KEY = requireEnv("API_KEY");
const CLAN_TAG = requireEnv("CLAN_TAG");

async function fetchFromApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
        headers: { Authorization: `Bearer ${API_KEY}`},
    });

    if (!response.ok) {
        throw new Error(`Clash Royale API error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
}

interface ClanResponse {
    memberList: ApiMember[];
}

export async function getClanMembers(): Promise<ApiMember[]> {
    const data = await fetchFromApi<ClanResponse>(`clans/%23${CLAN_TAG}`);

    return data.memberList;
}