// /lib/api.ts
import {
    LeetCodeUserProfile,
    CodeforcesUserProfile,
    CodeChefUserProfile,
    AtCoderUserProfile,
    Platform,
    ProblemsApiResponse,
    GetProblemsParams,
    ContestsApiResponse,
    UnifiedProblem,
    ProblemPlatform,
} from "./types";

// 1. Normalize NEXT_BASE_URL and define APP_BASE_URL correctly
let baseUrl = process.env.NEXT_BASE_URL || 'http://localhost:3000';
if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1); // Remove trailing slash if present
}
const APP_BASE_URL = baseUrl; // This is now like https://cp-dashboard-jade.vercel.app

async function fetchUserData(
    platform: Platform,
    username: string
): Promise<LeetCodeUserProfile | CodeforcesUserProfile | CodeChefUserProfile | AtCoderUserProfile> {
    if (!username.trim()) {
        console.error("Username cannot be empty in fetchUserData.");
        throw new Error("Username cannot be empty.");
    }

    // 2. Construct the correct API path including "/api"
    const apiUrl = `${APP_BASE_URL}/api/${platform}/getUser?username=${encodeURIComponent(username.trim())}`;
    console.log(`[api.ts] Fetching user data from: ${apiUrl}`);

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            let errorResponseMessage = `Network response was not ok: ${response.statusText} (Status: ${response.status})`;
            try {
                const errorData = await response.json();
                errorResponseMessage = errorData.error || errorData.message || errorResponseMessage;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                const rawErrorText = await response.text().catch(() => `Status: ${response.status}, could not read error response.`);
                errorResponseMessage = `Network response error: ${rawErrorText.substring(0, 200)}`;
                console.error(`[api.ts] Failed to parse error JSON for ${platform}/${username}. Status: ${response.status}. Raw error: ${rawErrorText}`);
            }
            throw new Error(
                `Failed to fetch data for ${username} from ${platform}: ${errorResponseMessage}`
            );
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`[api.ts] Error in fetchUserData for ${platform}/${username}:`, error);
        throw error;
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

