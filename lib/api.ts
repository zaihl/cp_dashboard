// /lib/api.ts
import {
    LeetCodeUserProfile,
    CodeforcesUserProfile,
    CodeChefUserProfile,
    Platform,
} from "./types";

const API_BASE_URL = `${process.env.NEXT_BASE_URL}/api`; 

async function fetchUserData(
    platform: Platform,
    username: string
): Promise<LeetCodeUserProfile | CodeforcesUserProfile | CodeChefUserProfile | null> {
    if (!username.trim()) {
        throw new Error("Username cannot be empty.");
    }
    try {
        const response = await fetch(
            `${API_BASE_URL}/${platform}/getUser?username=${encodeURIComponent(username)}`
        );
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(
                `Failed to fetch data for ${username} from ${platform}: ${errorData.message || response.statusText} (Status: ${response.status})`
            );
        }
        const data = await response.json();

        // Here you might want to add Zod parsing on the client-side as well for robustness,
        // or trust the backend's Zod validation. For simplicity, I'm omitting client-side Zod here.
        return data;
    } catch (error) {
        console.error(`Error fetching user data for ${platform}:`, error);
        throw error; // Re-throw to be caught by the component
    }
}

export async function getLeetCodeUser(username: string) {
    return fetchUserData("leetcode", username);
}

export async function getCodeforcesUser(username: string) {
    return fetchUserData("codeforces", username);
}

export async function getCodeChefUser(username: string) {
    return fetchUserData("codechef", username);
}
