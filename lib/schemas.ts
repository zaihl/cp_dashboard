// lib/schemas.ts
import { z } from 'zod';

export const leetCodeUserDataSchema = z.object({
    username: z.string(),
    profile: z.object({
        realName: z.string(),
        websites: z.array(z.string()),
        countryName: z.string().nullable(),
        company: z.string().nullable(),
        school: z.string().nullable(),
        aboutMe: z.string(),
        reputation: z.number(),
        ranking: z.number()
    }),
    submitStats: z.object({
        acSubmissionNum: z.array(
            z.object({
                difficulty: z.string(),
                count: z.number(),
                submissions: z.number()
            })
        ),
        totalSubmissionNum: z.array(
            z.object({
                difficulty: z.string(),
                count: z.number(),
                submissions: z.number()
            })
        )
    })
});

export const leetCodeUserContestSchema = z.object({
    userContestRanking: z.object({
        attendedContestsCount: z.number(),
        rating: z.number(),
        globalRanking: z.number(),
        totalParticipants: z.number(),
        topPercentage: z.number()
    }),
    userContestRankingHistory: z.array(
        z.object({
            attended: z.boolean(),
            trendDirection: z.string(),
            problemsSolved: z.number(),
            totalProblems: z.number(),
            finishTimeInSeconds: z.number(),
            rating: z.number(),
            ranking: z.number()
        })
    )
});
export type LeetCodeUserContest = z.infer<typeof leetCodeUserContestSchema>;

export const leetCodeUserSubmissionSchema = z.object({
    title: z.string(),
    titleSlug: z.string(),
    timestamp: z.string(),
    statusDisplay: z.string(),
    lang: z.string(),
    url: z.string()
});
export type LeetCodeUserSubmission = z.infer<typeof leetCodeUserSubmissionSchema>;

export const codeforcesProblemSchema = z.object({
    contestId: z.number().optional(),
    problemsetName: z.string().optional(),
    index: z.string(),
    name: z.string(),
    type: z.enum(["PROGRAMMING", "QUESTION"]),
    points: z.number().optional(),
    rating: z.number().optional(),
    tags: z.array(z.string()),
});

export const codeforcesMemberSchema = z.object({
    handle: z.string(),
    name: z.string().optional(),
});

export const codeforcesPartySchema = z.object({
    contestId: z.number().optional(),
    members: z.array(codeforcesMemberSchema),
    participantType: z.enum([
        "CONTESTANT",
        "PRACTICE",
        "VIRTUAL",
        "MANAGER",
        "OUT_OF_COMPETITION",
    ]),
    teamId: z.number().optional(),
    teamName: z.string().optional(),
    ghost: z.boolean(),
    room: z.number().optional(),
    startTimeSeconds: z.number().optional(),
});

export const codeforcesUserSchema = z.object({
    handle: z.string(),
    email: z.string().optional(),
    vkId: z.string().optional(),
    openId: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    organization: z.string().optional(),
    contribution: z.number(),
    rank: z.string(),
    rating: z.number(),
    maxRank: z.string(),
    maxRating: z.number(),
    lastOnlineTimeSeconds: z.number(),
    registrationTimeSeconds: z.number(),
    friendOfCount: z.number(),
    avatar: z.string(),
    titlePhoto: z.string(),
});
export type CodeforcesUser = z.infer<typeof codeforcesUserSchema>;

export const codeforcesSubmissionSchema = z.object({
    id: z.number(),
    contestId: z.number().optional(),
    creationTimeSeconds: z.number(),
    relativeTimeSeconds: z.number(),
    problem: codeforcesProblemSchema,
    author: codeforcesPartySchema,
    programmingLanguage: z.string(),
    verdict: z.enum([
        "FAILED", "OK", "PARTIAL", "COMPILATION_ERROR", "RUNTIME_ERROR",
        "WRONG_ANSWER", "PRESENTATION_ERROR", "TIME_LIMIT_EXCEEDED", "MEMORY_LIMIT_EXCEEDED",
        "IDLENESS_LIMIT_EXCEEDED", "SECURITY_VIOLATED", "CRASHED",
        "INPUT_PREPARATION_CRASHED", "CHALLENGED", "SKIPPED", "TESTING",
        "REJECTED", "SUBMITTED" // Added SUBMITTED as per common API patterns
    ]).optional(),
    testset: z.enum([
        "SAMPLES", "PRETESTS", "TESTS", "CHALLENGES", "TESTS1", "TESTS2",
        "TESTS3", "TESTS4", "TESTS5", "TESTS6", "TESTS7", "TESTS8",
        "TESTS9", "TESTS10" // Added more testset types
    ]),
    passedTestCount: z.number(),
    timeConsumedMillis: z.number(),
    memoryConsumedBytes: z.number(),
    points: z.number().optional(),
});
export type CodeforcesSubmission = z.infer<typeof codeforcesSubmissionSchema>;

export const codeforcesRatingChangeSchema = z.object({
    contestId: z.number(),
    contestName: z.string(),
    handle: z.string(),
    rank: z.number(),
    ratingUpdateTimeSeconds: z.number(),
    oldRating: z.number(),
    newRating: z.number(),
});
export type CodeforcesRatingChange = z.infer<typeof codeforcesRatingChangeSchema>;

export const codeforcesUserProfileSchema = z.object({
    userInfo: codeforcesUserSchema,
    userSubmissions: z.array(codeforcesSubmissionSchema),
    userRatingChanges: z.array(codeforcesRatingChangeSchema),
});

export const codeChefHeatMapEntrySchema = z.object({
    date: z.string(),
    value: z.number(),
});

export const codeChefRatingDataEntrySchema = z.object({
    code: z.string(),
    getyear: z.string(),
    getmonth: z.string(),
    getday: z.string(),
    reason: z.string().nullable(),
    penalised_in: z.string().nullable(),
    rating: z.string().transform(val => parseInt(val, 10)),
    rank: z.string().transform(val => parseInt(val, 10)),
    name: z.string(),
    end_date: z.string(),
    color: z.string(),
});

// Then, define the main schema that uses the above schemas
export const codeChefUserSchema = z.object({
    success: z.boolean(),
    status: z.number(),
    profile: z.string().url(),
    name: z.string(),
    currentRating: z.number(),
    highestRating: z.number(),
    countryFlag: z.string().url(),
    countryName: z.string(),
    globalRank: z.number().nullable(),
    countryRank: z.number().nullable(),
    stars: z.string(),
    heatMap: z.array(codeChefHeatMapEntrySchema), // Uses codeChefHeatMapEntrySchema
    ratingData: z.array(codeChefRatingDataEntrySchema), // Uses codeChefRatingDataEntrySchema
});

// Schema for individual submission from AtCoder API (remains the same)
export const atCoderApiSubmissionSchema = z.object({
    id: z.number(),
    epoch_second: z.number(),
    problem_id: z.string(),
    contest_id: z.string(),
    user_id: z.string(),
    language: z.string(),
    point: z.number(),
    length: z.number(),
    result: z.string(), // e.g., "AC", "WA"
    execution_time: z.number().nullable().optional(),
});
export type AtCoderApiSubmission = z.infer<typeof atCoderApiSubmissionSchema>;

// Processed submission entry (remains the same)
export const atCoderProcessedSubmissionSchema = z.object({
    id: z.number(),
    problemId: z.string(),
    contestId: z.string(),
    language: z.string(),
    verdict: z.string(),
    points: z.number(),
    submittedAtSeconds: z.number(),
});
export type AtCoderProcessedSubmission = z.infer<typeof atCoderProcessedSubmissionSchema>;

// Schema for user rank statistics (simplified example, API might just return a number or rank object)
export const atCoderUserRankSchema = z.object({
    count: z.number().optional(), // For AC count or rated point sum
    rank: z.number().optional(),  // For global rank if available directly
    // The language_rank API might return something like: [{ language: "C++", count: 100 }, ...]
});
export type AtCoderUserRank = z.infer<typeof atCoderUserRankSchema>;


// Updated AtCoder User Profile Structure for our API
export const atCoderUserProfileSchema = z.object({
    handle: z.string(),
    acceptedCount: z.number().optional(), // From ac_rank if we fetch the count
    acceptedCountRank: z.number().optional(), // From ac_rank if we fetch the rank
    ratedPointSum: z.number().optional(), // From rated_point_sum_rank
    ratedPointSumRank: z.number().optional(), // From rated_point_sum_rank
    // Streak info would also go here if fetched
    // Language stats could be an array: languageStatistics: z.array(z.object({ language: z.string(), count: z.number() })).optional(),
    recentSubmissions: z.array(atCoderProcessedSubmissionSchema),
    // Removed currentRating, highestRating, contestHistory as we don't have a non-deprecated API for them directly
});

export type AtCoderUserProfile = z.infer<typeof atCoderUserProfileSchema>;
export type CodeChefUser = z.infer<typeof codeChefUserSchema>;
export type CodeforcesUserProfile = z.infer<typeof codeforcesUserProfileSchema>;
export type LeetCodeUserData = z.infer<typeof leetCodeUserDataSchema>;