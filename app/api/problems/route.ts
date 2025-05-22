// app/api/problems/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UnifiedProblem, ProblemPlatform } from '@/lib/types'; // Adjust path if necessary

// --- Helper: Fetch and Normalize LeetCode Problems ---
interface LeetCodeProblemRaw {
    id: string; // This is an internal ID, not the frontend_id
    frontend_id: string;
    title: string;
    title_slug: string;
    url: string;
    difficulty: string; // "Easy", "Medium", "Hard"
    paid_only: boolean;
    // ... other fields like has_solution, has_video_solution
}
async function fetchAndNormalizeLeetCode(limit: number = 50): Promise<UnifiedProblem[]> {
    try {
        const response = await fetch('https://leetcode-api-pied.vercel.app/problems');
        if (!response.ok) {
            console.error(`LeetCode API Error: ${response.status} ${await response.text()}`);
            return [];
        }
        const data: LeetCodeProblemRaw[] = await response.json();
        // The API returns a lot, let's take a slice for demo
        return data.slice(0, limit).map(p => ({
            id: `leetcode_${p.title_slug}`, // Create a unique ID
            title: p.title,
            url: p.url,
            platform: 'LeetCode',
            difficulty: p.difficulty,
            tags: [], // This specific LeetCode API doesn't provide tags directly for the general list
            problemIdOnPlatform: p.frontend_id, // Use frontend_id for display/linking
            contestId: undefined, // LeetCode problems are not typically tied to contests in this API list
            paidOnly: p.paid_only,
        }));
    } catch (error) {
        console.error("Failed to fetch or normalize LeetCode problems:", error);
        return [];
    }
}

// --- Helper: Fetch and Normalize Codeforces Problems ---
interface CodeforcesProblemRaw {
    contestId?: number;
    problemsetName?: string;
    index: string; // e.g., "A", "B1"
    name: string;
    type: "PROGRAMMING" | "QUESTION";
    points?: number;
    rating?: number; // Difficulty rating
    tags: string[];
}
interface CodeforcesProblemStatisticsRaw {
    contestId?: number;
    index: string;
    solvedCount: number;
}
interface CodeforcesApiResponse {
    status: string;
    result?: {
        problems: CodeforcesProblemRaw[];
        problemStatistics: CodeforcesProblemStatisticsRaw[];
    };
    comment?: string;
}
async function fetchAndNormalizeCodeforces(limit: number = 50): Promise<UnifiedProblem[]> {
    try {
        // Fetching all problems can be huge. For demo, let's fetch problems without specific tags initially.
        // The API might return a very large list.
        const response = await fetch('https://codeforces.com/api/problemset.problems');
        if (!response.ok) {
            console.error(`Codeforces API Error: ${response.status} ${await response.text()}`);
            return [];
        }
        const data: CodeforcesApiResponse = await response.json();
        if (data.status !== 'OK' || !data.result) {
            console.error(`Codeforces API did not return OK: ${data.comment || 'Unknown error'}`);
            return [];
        }
        const { problems, problemStatistics } = data.result;
        const statsMap = new Map(problemStatistics.map(s => [`${s.contestId}_${s.index}`, s.solvedCount]));

        // Sort by rating (desc) or contestId (desc) to get somewhat "relevant" or "recent" problems for slicing
        const sortedProblems = problems.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.contestId || 0) - (a.contestId || 0));

        return sortedProblems.slice(0, limit).map(p => ({
            id: `codeforces_${p.contestId || 'gym'}_${p.index}`,
            title: p.name,
            url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
            platform: 'Codeforces',
            difficulty: p.rating, // This is the numerical rating
            tags: p.tags,
            problemIdOnPlatform: p.index,
            contestId: p.contestId?.toString(),
            solvedCount: statsMap.get(`${p.contestId}_${p.index}`),
        }));
    } catch (error) {
        console.error("Failed to fetch or normalize Codeforces problems:", error);
        return [];
    }
}

// --- Helper: Fetch and Normalize AtCoder Problems ---
interface AtCoderProblemRaw {
    id: string; // e.g., "abc001_a" (problem_id from the API)
    contest_id: string; // e.g., "abc001"
    problem_index: string; // e.g., "A" (often part of the title)
    name: string; // e.g., "Problem Name"
    title: string; // e.g., "A. Problem Name"
    // AtCoder problems.json doesn't directly provide difficulty/rating or tags per problem.
    // This info is often in merged-problems.json or problem-models.json from AtCoderProblems.
}
async function fetchAndNormalizeAtCoder(limit: number = 50): Promise<UnifiedProblem[]> {
    try {
        const response = await fetch('https://kenkoooo.com/atcoder/resources/problems.json');
        if (!response.ok) {
            console.error(`AtCoder API Error: ${response.status} ${await response.text()}`);
            return [];
        }
        const data: AtCoderProblemRaw[] = await response.json();
        // The data is an array of problems. Slice for limit.
        return data.slice(0, limit).map(p => ({
            id: `atcoder_${p.id}`, // Use the given 'id' field which is unique
            title: p.name, // 'name' is usually cleaner than 'title' which includes "A. "
            url: `https://atcoder.jp/contests/${p.contest_id}/tasks/${p.id}`,
            platform: 'AtCoder',
            // Difficulty/tags would need to be merged from other AtCoder resources (e.g., problem-models.json for difficulty)
            // For now, we'll leave them undefined or provide placeholders.
            difficulty: undefined, // Or fetch from problem-models.json and map by p.id
            tags: [], // Or fetch from merged-problems.json and map by p.id
            problemIdOnPlatform: p.id,
            contestId: p.contest_id,
        }));
    } catch (error) {
        console.error("Failed to fetch or normalize AtCoder problems:", error);
        return [];
    }
}


// Main GET handler
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search')?.toLowerCase().trim() || '';
    const platformFilter = searchParams.get('platform') as ProblemPlatform | null;
    const difficultyFilter = searchParams.get('difficulty')?.toLowerCase().trim() || '';
    const tagsFilter = searchParams.get('tags')?.toLowerCase().split(',').map(tag => tag.trim()).filter(Boolean) || [];
    const page = parseInt(searchParams.get('page') || '1', 10);
    const requestLimit = parseInt(searchParams.get('limit') || '24', 10); // How many items per page

    try {
        // **DEMO NOTE:** Fetching a larger initial set to allow for some in-memory filtering.
        // In production, filtering would happen at the database level.
        const initialFetchLimit = 200; // Fetch more initially to have data to filter
        let allProblems: UnifiedProblem[] = [];

        // Conditional fetching based on platform filter or if no filter is applied
        if (!platformFilter || platformFilter === 'LeetCode') {
            allProblems = allProblems.concat(await fetchAndNormalizeLeetCode(initialFetchLimit));
        }
        if (!platformFilter || platformFilter === 'Codeforces') {
            allProblems = allProblems.concat(await fetchAndNormalizeCodeforces(initialFetchLimit));
        }
        if (!platformFilter || platformFilter === 'AtCoder') {
            allProblems = allProblems.concat(await fetchAndNormalizeAtCoder(initialFetchLimit));
        }

        // Remove duplicates just in case (highly unlikely with prefixed IDs)
        allProblems = Array.from(new Map(allProblems.map(p => [p.id, p])).values());

        // --- Filtering Logic ---
        let filteredProblems = allProblems;

        if (searchQuery) {
            filteredProblems = filteredProblems.filter(p =>
                p.title.toLowerCase().includes(searchQuery) ||
                (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchQuery))) ||
                p.problemIdOnPlatform.toLowerCase().includes(searchQuery) ||
                (p.contestId && p.contestId.toLowerCase().includes(searchQuery))
            );
        }

        if (difficultyFilter) {
            filteredProblems = filteredProblems.filter(p => {
                if (p.difficulty === undefined && difficultyFilter === "unknown") return true;
                if (typeof p.difficulty === 'string') { // LeetCode: "Easy", "Medium", "Hard"
                    return p.difficulty.toLowerCase() === difficultyFilter;
                } else if (typeof p.difficulty === 'number') { // Codeforces/AtCoder: Rating
                    if (difficultyFilter.includes('-')) {
                        const [minStr, maxStr] = difficultyFilter.split('-');
                        const min = parseInt(minStr, 10);
                        const max = parseInt(maxStr, 10);
                        return !isNaN(min) && !isNaN(max) && p.difficulty >= min && p.difficulty <= max;
                    } else {
                        const diffNum = parseInt(difficultyFilter, 10);
                        return !isNaN(diffNum) && p.difficulty === diffNum;
                    }
                }
                return false;
            });
        }

        if (tagsFilter.length > 0) {
            filteredProblems = filteredProblems.filter(p =>
                p.tags && tagsFilter.every(filterTag => p.tags!.some(problemTag => problemTag.toLowerCase().includes(filterTag)))
            );
        }

        // --- Pagination ---
        const totalProblems = filteredProblems.length;
        const paginatedProblems = filteredProblems.slice((page - 1) * requestLimit, page * requestLimit);

        return NextResponse.json({
            problems: paginatedProblems,
            totalPages: Math.ceil(totalProblems / requestLimit),
            currentPage: page,
            totalProblems: totalProblems,
        });

    } catch (error) {
        console.error("Error in /api/problems GET handler:", error);
        return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
    }
}