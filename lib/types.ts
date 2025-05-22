// /lib/types.ts

// LeetCode
export interface LeetCodeUserSubmission {
    title: string;
    titleSlug: string;
    timestamp: string;
    statusDisplay: string;
    lang: string;
    url: string;
}

export interface LeetCodeTotalSubmissionsNum {
    difficulty: string;
    count: number;
    submissions: number;
}

export interface LeetCodeUserData {
    username: string;
    realName: string;
    websites: string[];
    countryName: string | null;
    company: string | null;
    school: string | null;
    aboutMe: string;
    reputation: number;
    ranking: number;
    totalSubmissionsNum: LeetCodeTotalSubmissionsNum[];
}

export interface LeetCodeUserContestData {
    userContestRanking: {
        attendedContestsCount: number;
        rating: number;
        globalRanking: number;
        totalParticipants: number;
        topPercentage: number;
    };
}

export interface LeetCodeUserProfile {
    userData: LeetCodeUserData;
    userContests: LeetCodeUserContestData;
    userSubmissions: LeetCodeUserSubmission[];
}

// Codeforces
export interface CodeforcesProblem {
    contestId?: number;
    index: string;
    name: string;
    rating?: number;
    tags: string[];
}

export interface CodeforcesSubmission {
    id: number;
    contestId?: number;
    problem: CodeforcesProblem;
    programmingLanguage: string;
    verdict?: string;
    creationTimeSeconds: number;
}

export interface CodeforcesUserInfo {
    handle: string;
    rank: string;
    rating: number;
    maxRank: string;
    maxRating: number;
    avatar: string;
    organization?: string;
    country?: string;
    contribution: number;
    friendOfCount: number;
    lastOnlineTimeSeconds: number;
    registrationTimeSeconds: number; 
}

export interface CodeforcesRatingChange {
    contestId: number;
    contestName: string;
    handle: string;
    rank: number;
    ratingUpdateTimeSeconds: number;
    oldRating: number;
    newRating: number;
}

export interface CodeforcesUserProfile {
    userInfo: CodeforcesUserInfo;
    userSubmissions: CodeforcesSubmission[];
    userRatingChanges: CodeforcesRatingChange[];
}

// CodeChef
export interface CodeChefHeatMapEntry {
    date: string; // YYYY-MM-DD
    value: number; // Number of submissions
}

export interface CodeChefRatingDataEntry {
    name: string; // Contest name
    rating: number;
    rank: number;
    end_date: string;
}

export interface CodeChefUserProfile {
    success: boolean;
    status: number;
    profile: string; // URL to profile picture
    name: string;
    currentRating: number;
    highestRating: number;
    countryFlag: string; // URL
    countryName: string;
    globalRank: number | null;
    countryRank: number | null;
    stars: string; // e.g., "5★"
    heatMap: CodeChefHeatMapEntry[];
    ratingData: CodeChefRatingDataEntry[];
}

// General API Response Type
export type UserProfile = LeetCodeUserProfile | CodeforcesUserProfile | CodeChefUserProfile;

export type Platform = "leetcode" | "codeforces" | "codechef";