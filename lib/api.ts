// /lib/api.ts
import {
    LeetCodeUserProfile,
    CodeforcesUserProfile,
    CodeChefUserProfile,
    AtCoderUserProfile,
    Platform,
    UnifiedProblem, // Should come from lib/types
    ProblemPlatform, // Should come from lib/types
    ProblemsApiResponse, // Can be defined here or in lib/types
    GetProblemsParams, // Can be defined here or in lib/types
    ContestsApiResponse,
} from "./types";

const APP_BASE_URL = process.env.NEXT_BASE_URL || 'http://localhost:3000';

async function fetchUserData(
    platform: Platform,
    username: string
): Promise<LeetCodeUserProfile | CodeforcesUserProfile | CodeChefUserProfile | AtCoderUserProfile | null> {
    if (!username.trim()) {
        throw new Error("Username cannot be empty.");
    }
    try {
        const response = await fetch(
            `${APP_BASE_URL}/api/${platform}/getUser?username=${encodeURIComponent(username)}`
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

export const getAtCoderUser = (username: string) => {
    return fetchUserData("atcoder", username);
};

// --- New function to fetch aggregated problems ---
export const getProblems = async (params: GetProblemsParams = {}): Promise<ProblemsApiResponse> => {
    const query = new URLSearchParams();

    // Append parameters if they exist and are not empty
    if (params.search?.trim()) query.set('search', params.search.trim());
    if (params.platform) query.set('platform', params.platform); // Empty string for 'platform' means "all" on backend
    if (params.difficulty?.trim()) query.set('difficulty', params.difficulty.trim());
    if (params.tags && params.tags.length > 0) {
        query.set('tags', params.tags.map(tag => tag.trim()).filter(Boolean).join(','));
    }
    if (params.page && params.page > 0) query.set('page', params.page.toString());
    if (params.limit && params.limit > 0) query.set('limit', params.limit.toString());

    const queryString = query.toString();
    const fetchUrl = `${APP_BASE_URL}/api/problems${queryString ? `?${queryString}` : ''}`;


    const response = await fetch(fetchUrl);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch problems. Status: ${response.status}` }));
        console.error('[api.ts] Error fetching problems:', response.status, errorData);
        throw new Error(errorData.message || `Failed to fetch problems. Status: ${response.status}`);
    }
    return response.json();
};

export interface GetContestsParams {
    page: number;
    filter: string;
    upcoming?: boolean;
    past?: boolean;
    limit?: number;
    offset?: number;
    resources?: string; // Comma-separated platform names (you'll map these or pass to CLIST)
}

export const getContests = async (params: GetContestsParams = {
    page: 0,
    filter: ""
}): Promise<ContestsApiResponse> => {
    const query = new URLSearchParams();
    if (params.upcoming !== undefined) query.set('upcoming', String(params.upcoming));
    if (params.past !== undefined) query.set('past', String(params.past));
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.offset) query.set('offset', params.offset.toString());
    if (params.resources) query.set('resources', params.resources); // Pass along for backend to handle

    const queryString = query.toString();
    // Assuming APP_BASE_URL is defined in your lib/api.ts or config
    const fetchUrl = `${APP_BASE_URL}/api/contests${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(fetchUrl);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch contests. Status: ${response.status}` }));
        throw new Error(errorData.error || `Failed to fetch contests. Status: ${response.status}`);
    }
    return response.json();
};

export type { ProblemsApiResponse, GetProblemsParams, UnifiedProblem, ProblemPlatform };
export type { ContestsApiResponse };

