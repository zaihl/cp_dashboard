// app/api/atcoder/fetchUserData.ts
import { z } from 'zod';
import {
    atCoderApiSubmissionSchema,
    type AtCoderApiSubmission,
    type AtCoderUserProfile,
    type AtCoderProcessedSubmission,
} from '@/lib/schemas'; // Adjust path

const ATCODER_API_BASE_URL = 'https://kenkoooo.com/atcoder/atcoder-api/v3';

// Fetch user submissions (e.g., latest 50)
async function fetchUserSubmissions(handle: string, count: number = 50): Promise<AtCoderApiSubmission[]> {
    // Fetch submissions from a very old date (or 0) to get many, then take the latest ones.
    const response = await fetch(`${ATCODER_API_BASE_URL}/user/submissions?user=${encodeURIComponent(handle)}&from_second=0`);
    if (!response.ok) {
        throw new Error(`Failed to fetch AtCoder submissions for ${handle}: ${response.status}`);
    }
    const rawData: unknown = await response.json();
    const parsed = z.array(atCoderApiSubmissionSchema).safeParse(rawData);
    if (!parsed.success) {
        console.error(`Zod Parsing Error (AtCoder user/submissions) for ${handle}:`, parsed.error.format());
        throw new Error(`Invalid structure for AtCoder submissions for ${handle}.`);
    }
    // Sort by epoch_second descending to get latest first, then take 'count'
    return parsed.data.sort((a, b) => b.epoch_second - a.epoch_second).slice(0, count);
}

// Helper to fetch a specific rank statistic
async function fetchUserRankStat(handle: string, statType: 'ac_rank' | 'rated_point_sum_rank' | 'streak_rank'): Promise<{ value: number | null, rank: number | null }> {
    // The API for these might return just a number (the value like AC count) or an object with rank.
    // Let's assume it returns an object like { count: 123, rank: 456 } or just the count/sum for now.
    // This is a simplification; you'll need to inspect the actual API response for each.
    // For example, `user/ac_rank` might return an object `{ count: number }` rather than rank.
    // The global ranking endpoints `ac_ranking` return arrays of users.
    // For simplicity, let's assume `user/{statType}` gives us what we need for now.
    // This part needs careful implementation based on actual API responses for each rank type.
    // For now, I'll mock a structure.
    try {
        const response = await fetch(`${ATCODER_API_BASE_URL}/user/${statType}?user=${encodeURIComponent(handle)}`);
        if (!response.ok) {
            console.warn(`AtCoder API Warning (user/${statType}) for ${handle}: ${response.status}. Stat will be null.`);
            return { value: null, rank: null };
        }
        const data = await response.json();

        // EXAMPLE: Adjust based on actual API response.
        // If data is just a number (e.g. total ACs):
        if (typeof data === 'number') return { value: data, rank: null };
        // If data is an object like { count: X, rank: Y } or similar:
        if (typeof data === 'object' && data !== null) {
            // This depends heavily on the actual structure.
            // For 'user/ac_rank', the API docs suggest it might return a simple count for the user.
            // For example, let's assume `ac_rank` returns `{ "count": 123 }`
            // and `rated_point_sum_rank` returns `{ "count": 5000 }`
            if (statType === 'ac_rank' && 'count' in data) return { value: data.count as number, rank: null }; // Assuming rank is not directly given here
            if (statType === 'rated_point_sum_rank' && 'count' in data) return { value: data.count as number, rank: null }; // Assuming rank is not directly given here
            // The actual rank might need to be fetched from the global ranking lists and finding the user, which is more complex.
        }
        return { value: null, rank: null }; // Fallback
    } catch (error) {
        console.warn(`Error fetching AtCoder user/${statType} for ${handle}:`, error);
        return { value: null, rank: null };
    }
}


function processAtCoderSubmissions(submissions: AtCoderApiSubmission[]): AtCoderProcessedSubmission[] {
    return submissions.map(sub => ({
        id: sub.id,
        problemId: sub.problem_id,
        contestId: sub.contest_id,
        language: sub.language,
        verdict: sub.result,
        points: sub.point,
        submittedAtSeconds: sub.epoch_second,
    }));
}

export const fetchAtCoderUser = async (handle: string): Promise<AtCoderUserProfile> => {
    try {
        // Fetch submissions first, as it's the most reliable piece of data
        const userSubmissionsData = await fetchUserSubmissions(handle, 20); // Fetch latest 20
        const recentSubmissions = processAtCoderSubmissions(userSubmissionsData);

        // Fetch other stats - these are examples and might need adjustment based on exact API response
        // For simplicity, I'm fetching AC count and Rated Point Sum. Streak and Language stats could be added similarly.
        const acInfo = await fetchUserRankStat(handle, 'ac_rank');
        const ratedPointSumInfo = await fetchUserRankStat(handle, 'rated_point_sum_rank');

        return {
            handle,
            acceptedCount: acInfo.value ?? undefined,
            acceptedCountRank: acInfo.rank ?? undefined, // This might not be available from user/ac_rank directly
            ratedPointSum: ratedPointSumInfo.value ?? undefined,
            ratedPointSumRank: ratedPointSumInfo.rank ?? undefined, // This might not be available directly
            recentSubmissions,
        };
    } catch (error) {
        console.error(`Failed to fetch comprehensive AtCoder user data for ${handle}:`, error);
        if (error instanceof Error && error.message.includes("Failed to fetch AtCoder submissions")) {
            // If submissions fail, we might not have enough to build a profile.
            // Or, decide to return partial data if other stats succeed.
            // For now, rethrow to indicate critical failure.
            throw error;
        }
        // If other stats fail, we might still return submissions.
        // This error handling strategy needs to be refined.
        // For now, let's assume any error in Promise.all is critical.
        throw error;
    }
};