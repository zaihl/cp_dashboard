/* eslint-disable @typescript-eslint/no-unused-vars */
// /app/api/leetcode/fetchUserData.ts
import { z } from 'zod';
import {
    leetCodeUserDataSchema,
    leetCodeUserContestSchema,
    leetCodeUserSubmissionSchema,
    type LeetCodeUserData,
    type LeetCodeUserContest,
    type LeetCodeUserSubmission,
} from '@/lib/schemas';

const baseUrl = 'https://leetcode-api-pied.vercel.app/user/';

export const fetchUserData = async (handle: string) => {
    const res = await fetch(`${baseUrl}${handle}`);
    if (!res.ok) {
        throw new Error('Failed to fetch user data');
    }

    const raw = await res.json();
    const parsed = leetCodeUserDataSchema.safeParse(raw);

    if (!parsed.success) {
        console.error(parsed.error.format());
        throw new Error('Invalid user data structure');
    }

    const { username, profile, submitStats } = parsed.data;

    const acMap = new Map<string, number>();
    for (const item of submitStats.acSubmissionNum) {
        acMap.set(item.difficulty.toLowerCase(), item.count);
    }

    const totalSubmissionsNum = submitStats.totalSubmissionNum.map((item) => {
        const difficulty = item.difficulty.toLowerCase();
        return {
            difficulty,
            count: acMap.get(difficulty) || 0,
            submissions: item.submissions,
        };
    });

    return {
        username,
        realName: profile.realName,
        websites: profile.websites,
        countryName: profile.countryName,
        company: profile.company,
        school: profile.school,
        aboutMe: profile.aboutMe,
        reputation: profile.reputation,
        ranking: profile.ranking,
        totalSubmissionsNum,
    };
};

export const fetchUserContests = async (username: string) => {
    const res = await fetch(`${baseUrl}${username}/contests`);
    if (!res.ok) {
        throw new Error('Failed to fetch contest data');
    }

    const raw = await res.json();
    const parsed = leetCodeUserContestSchema.safeParse(raw);

    if (!parsed.success) {
        console.error(parsed.error.format());
        throw new Error('Invalid contest data structure');
    }

    // ✅ Remove userContestRankingHistory
    const { userContestRanking } = parsed.data;
    return { userContestRanking };
};

export const fetchUserSubmissions = async (
    username: string,
    limit: number
): Promise<LeetCodeUserSubmission[]> => {
    const res = await fetch(`${baseUrl}${username}/submissions?limit=${limit}`);
    if (!res.ok) {
        throw new Error('Failed to fetch submission data');
    }

    const raw = await res.json();
    const parsed = z.array(leetCodeUserSubmissionSchema).safeParse(raw);

    if (!parsed.success) {
        console.error(parsed.error.format());
        throw new Error('Invalid submission data structure');
    }

    return parsed.data;
};

export const fetchLeetcodeUser = async (username: string) => {
    const [userData, userContests, userSubmissions] = await Promise.all([
        fetchUserData(username),
        fetchUserContests(username),
        fetchUserSubmissions(username, 100),
    ]);
    return {
        userData,
        userContests,
        userSubmissions,
    };
};
