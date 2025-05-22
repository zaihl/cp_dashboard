// /app/api/codeforces/fetchUserData.ts
import { z } from 'zod';
import {
    codeforcesUserSchema,
    codeforcesSubmissionSchema,
    codeforcesRatingChangeSchema,
    CodeforcesUser,
    CodeforcesSubmission,
    CodeforcesRatingChange,
    CodeforcesUserProfile,
} from '@/lib/schemas'; // Adjust path as needed

const CODEFORCES_API_BASE_URL = 'https://codeforces.com/api/';

// Helper to parse Codeforces API responses
async function parseCodeforcesResponse<T extends z.ZodTypeAny>(
    response: Response,
    schema: T
): Promise<z.infer<T>> {
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Codeforces API Error:", response.status, errorText);
        throw new Error(`Failed to fetch data from Codeforces API: ${response.status} ${errorText}`);
    }
    const raw = await response.json();

    // Codeforces API wraps results in { status: "OK", result: ... }
    const apiResponseSchema = z.object({
        status: z.literal("OK"),
        result: schema,
    });

    const parsedResponse = apiResponseSchema.safeParse(raw);

    if (!parsedResponse.success) {
        console.error("Zod Parsing Error (API Response Wrapper):", parsedResponse.error.format());
        throw new Error('Invalid Codeforces API response structure');
    }
    return parsedResponse.data.result;
}


export const fetchCodeforcesUserInfo = async (handle: string): Promise<CodeforcesUser> => {
    const res = await fetch(`${CODEFORCES_API_BASE_URL}user.info?handles=${handle}`);
    // user.info returns an array, we expect one user for a given handle
    const usersArraySchema = z.array(codeforcesUserSchema).min(1);
    const users = await parseCodeforcesResponse(res, usersArraySchema);
    return users[0]; // Return the first user object
};

export const fetchCodeforcesUserStatus = async (
    handle: string,
    count: number = 10 // Default to 10 submissions
): Promise<CodeforcesSubmission[]> => {
    const res = await fetch(`${CODEFORCES_API_BASE_URL}user.status?handle=${handle}&from=1&count=${count}`);
    const submissionsSchema = z.array(codeforcesSubmissionSchema);
    return parseCodeforcesResponse(res, submissionsSchema);
};

export const fetchCodeforcesUserRating = async (handle: string): Promise<CodeforcesRatingChange[]> => {
    const res = await fetch(`${CODEFORCES_API_BASE_URL}user.rating?handle=${handle}`);
    const ratingChangesSchema = z.array(codeforcesRatingChangeSchema);
    return parseCodeforcesResponse(res, ratingChangesSchema);
};

export const fetchCodeforcesUser = async (handle: string): Promise<CodeforcesUserProfile> => {
    try {
        const [userInfo, userSubmissions, userRatingChanges] = await Promise.all([
            fetchCodeforcesUserInfo(handle),
            fetchCodeforcesUserStatus(handle, 10), // Fetch latest 10 submissions
            fetchCodeforcesUserRating(handle),
        ]);

        return {
            userInfo,
            userSubmissions,
            userRatingChanges,
        };
    } catch (error) {
        console.error(`Failed to fetch comprehensive Codeforces user data for ${handle}:`, error);
        // Depending on how you want to handle partial failures or overall failure:
        // 1. Rethrow the error to be caught by the API route
        // 2. Return a specific error object or null
        throw error; // Rethrowing for now
    }
};