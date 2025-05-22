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

export interface AtCoderSubmissionEntry { // This can remain largely the same
    id: number;
    problemId: string;
    contestId: string;
    language: string;
    verdict: string;
    points: number;
    submittedAtSeconds: number;
}

// Updated AtCoder User Profile for Frontend
export interface AtCoderUserProfile {
    handle: string;
    acceptedCount?: number;
    acceptedCountRank?: number; // May not be available
    ratedPointSum?: number;
    ratedPointSumRank?: number; // May not be available
    // Add other stats if you fetch them (e.g., streak, language stats)
    recentSubmissions: AtCoderSubmissionEntry[];
}

// Update Union type
export type UserProfile = LeetCodeUserProfile | CodeforcesUserProfile | CodeChefUserProfile | AtCoderUserProfile;
export type Platform = "leetcode" | "codeforces" | "codechef" | "atcoder";


export type ProblemPlatform = 'LeetCode' | 'Codeforces' | 'AtCoder';

export interface UnifiedProblem {
    id: string;
    title: string;
    url: string;
    platform: ProblemPlatform;
    difficulty?: string | number;
    tags?: string[];
    problemIdOnPlatform: string;
    contestId?: string;
    paidOnly?: boolean;
    solvedCount?: number;
}

export interface ProblemsApiResponse {
    problems: UnifiedProblem[];
    totalPages: number;
    currentPage: number;
    totalProblems: number;
}

export interface GetProblemsParams {
    search?: string;
    platform?: ProblemPlatform | '';
    difficulty?: string;
    tags?: string[];
    page?: number;
    limit?: number;
}

export interface UnifiedContest {
    id: number; // CLIST.by uses a numeric ID
    event: string; // Contest Title
    href: string; // URL to the contest
    resource: string; // Platform name (e.g., "leetcode.com", "codeforces.com")
    host: string; // Cleaner platform name, often same as resource or derived
    start: string; // ISO 8601 datetime string (e.g., "2025-06-15T14:00:00")
    end: string; // ISO 8601 datetime string
    duration: number; // Duration in seconds
    // You might add derived fields like isUpcoming, isPast, platformLogo based on 'host'
    isUpcoming?: boolean;
    isPast?: boolean;
    platformDisplayName?: string; // e.g., "LeetCode", "Codeforces"
}

export interface ContestsApiResponse {
    totalPages: number;
    contests: UnifiedContest[];
    meta?: { // CLIST.by provides pagination meta
        limit: number;
        next: string | null;
        offset: number;
        previous: string | null;
        total_count: number;
    };
}

export interface GetContestsParams {
    upcoming?: boolean;
    past?: boolean;
    limit?: number;
    offset?: number; // For CLIST API call from backend
    resources?: string;
    page?: number; // For frontend state and query to our backend
}