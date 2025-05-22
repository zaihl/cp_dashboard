/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// app/problems/page.tsx
"use client";

import {
    useState,
    useEffect,
    useCallback,
    Suspense,
    useTransition,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    getProblems,
    ProblemsApiResponse,
    GetProblemsParams,
    UnifiedProblem,
    ProblemPlatform,
} from "@/lib/api"; // Make sure these are correctly exported
import {
    FaSearch,
    FaTimes,
    FaExternalLinkAlt,
    FaAngleLeft,
    FaAngleRight,
    FaSpinner,
} from "react-icons/fa";
import { debounce } from "lodash";

// --- Constants ---
const ITEMS_PER_PAGE = 24;
const DEBOUNCE_DELAY = 600;

const difficultyOptions: { label: string; value: string }[] = [
    { label: "All Difficulties", value: "" },
    { label: "Easy (LeetCode)", value: "easy" },
    { label: "Medium (LeetCode)", value: "medium" },
    { label: "Hard (LeetCode)", value: "hard" },
    { label: "800-1000 (CF/AC)", value: "800-1000" },
    { label: "1000-1200 (CF/AC)", value: "1000-1200" },
    { label: "1200-1400 (CF/AC)", value: "1200-1400" },
    { label: "1400-1600 (CF/AC)", value: "1400-1600" },
    { label: "1600-1900 (CF/AC)", value: "1600-1900" },
    { label: "1900-2100 (CF/AC)", value: "1900-2100" },
    { label: "2100-2400 (CF/AC)", value: "2100-2400" },
    { label: "2400+ (CF/AC)", value: "2400-5000" },
    { label: "Unknown/Other", value: "unknown" },
];

const platformOptions: { value: ProblemPlatform | ""; label: string }[] = [
    { value: "", label: "All Platforms" },
    { value: "LeetCode", label: "LeetCode" },
    { value: "Codeforces", label: "Codeforces" },
    { value: "AtCoder", label: "AtCoder" },
];

// --- Problem Card Component ---
const ProblemCard = ({ problem }: { problem: UnifiedProblem }) => {
    const getDifficultyClasses = (
        difficulty?: string | number,
        platform?: ProblemPlatform
    ): string => {
        if (difficulty === undefined || difficulty === null)
            return "border-slate-600 text-slate-400 bg-slate-700";
        const d = String(difficulty).toLowerCase();
        if (platform === "LeetCode") {
            if (d === "easy")
                return "border-green-500 text-green-300 bg-green-500/20";
            if (d === "medium")
                return "border-yellow-500 text-yellow-300 bg-yellow-500/20";
            if (d === "hard")
                return "border-red-500 text-red-300 bg-red-500/20";
        } else if (platform === "Codeforces" || platform === "AtCoder") {
            const rating = Number(difficulty);
            if (isNaN(rating))
                return "border-purple-500 text-purple-300 bg-purple-500/20"; // Non-numeric e.g. "Beginner"
            if (rating >= 2800)
                return "border-red-600 text-red-400 bg-red-600/20";
            if (rating >= 2400)
                return "border-orange-500 text-orange-400 bg-orange-500/20";
            if (rating >= 2000)
                return "border-yellow-500 text-yellow-400 bg-yellow-500/20";
            if (rating >= 1600)
                return "border-blue-500 text-blue-400 bg-blue-500/20";
            if (rating >= 1200)
                return "border-cyan-500 text-cyan-400 bg-cyan-500/20";
            if (rating >= 800)
                return "border-green-500 text-green-400 bg-green-500/20";
            if (rating > 0)
                return "border-gray-500 text-gray-300 bg-gray-500/20";
        }
        return "border-slate-600 text-slate-400 bg-slate-700";
    };
    const difficultyClasses = getDifficultyClasses(
        problem.difficulty,
        problem.platform
    );
    return (
        <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-lg p-4 hover:shadow-sky-500/30 transition-all duration-200 flex flex-col justify-between min-h-[160px]">
            <div>
                <h3
                    className="text-md font-semibold text-sky-300 mb-1.5 truncate transition-colors hover:text-sky-200"
                    title={problem.title}
                >
                    <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {problem.title}
                    </a>
                </h3>
                <div className="flex items-center justify-between text-xs mb-2">
                    <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${difficultyClasses}`}
                    >
                        {problem.difficulty !== undefined
                            ? String(problem.difficulty)
                            : "N/A"}
                    </span>
                    <span className="text-slate-400 font-medium">
                        {problem.platform}
                    </span>
                </div>
                {problem.tags && problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3 max-h-12 overflow-y-auto custom-scrollbar-thin">
                        {problem.tags.slice(0, 5).map((tag: string) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 text-[10px] bg-slate-700 text-slate-300 rounded-full shadow"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto self-start text-xs text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1.5 pt-1"
            >
                View Problem <FaExternalLinkAlt size={10} />
            </a>
        </div>
    );
};

// --- Skeleton Loader Component ---
const ProblemsPageContentSkeleton = () => (
    <div className="space-y-6">
        {" "}
        {/* Removed animate-pulse from here, individual elements handle it */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-slate-800/50 rounded-xl animate-pulse">
            {[...Array(3)].map((_, i) => (
                <div
                    key={`filter-skeleton-${i}`}
                    className="h-10 bg-slate-700 rounded-md"
                ></div>
            ))}
        </div>
        <div className="h-6 bg-slate-700 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(ITEMS_PER_PAGE)].map(
                (
                    _,
                    i // Use ITEMS_PER_PAGE
                ) => (
                    <div
                        key={`problem-card-skeleton-${i}`}
                        className="h-40 bg-slate-800/70 border border-slate-700/50 rounded-xl p-4 space-y-3 animate-pulse"
                    >
                        <div className="h-5 bg-slate-700 rounded w-3/4"></div>
                        <div className="flex justify-between">
                            <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                            <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                        </div>
                        <div className="flex gap-1">
                            <div className="h-3 bg-slate-700 rounded-full w-10"></div>
                            <div className="h-3 bg-slate-700 rounded-full w-12"></div>
                        </div>
                        <div className="h-4 bg-slate-700 rounded w-1/3 mt-auto"></div>
                    </div>
                )
            )}
        </div>
        <div className="flex justify-center items-center space-x-2 pt-8 animate-pulse">
            <div className="h-9 w-24 bg-slate-700 rounded-md"></div>
            <div className="h-9 w-9 bg-slate-700 rounded-md"></div>
            <div className="h-9 w-9 bg-slate-700 rounded-md"></div>
            <div className="h-9 w-24 bg-slate-700 rounded-md"></div>
        </div>
    </div>
);

// --- Main Page Component ---
function ProblemsPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParamsHook = useSearchParams();
    const [isPending, startTransition] = useTransition(); // For smoother UI updates

    const [problemsData, setProblemsData] =
        useState<ProblemsApiResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Combined loading state
    const [error, setError] = useState<string | null>(null);

    // Filters state initialized from URL search params
    const [searchTerm, setSearchTerm] = useState(
        () => searchParamsHook.get("search") || ""
    );
    const [selectedPlatform, setSelectedPlatform] = useState<
        ProblemPlatform | ""
    >(() => (searchParamsHook.get("platform") as ProblemPlatform) || "");
    const [selectedDifficulty, setSelectedDifficulty] = useState(
        () => searchParamsHook.get("difficulty") || ""
    );
    const [selectedTags, setSelectedTags] = useState<string[]>(
        () => searchParamsHook.get("tags")?.split(",").filter(Boolean) || []
    );
    const [currentPage, setCurrentPage] = useState(() =>
        parseInt(searchParamsHook.get("page") || "1", 10)
    );
    const [tagInput, setTagInput] = useState("");

    // Memoized fetch function
    const fetchProblemsData = useCallback(async (params: GetProblemsParams) => {
        setIsLoading(true);
        setError(null);
        // If it's not an initial load (problemsData exists), we don't clear it,
        // allowing old data to show while new page loads (improves pagination UX)
        // The full skeleton is shown if `isLoading` is true and `problemsData` is null.
        try {
            const data = await getProblems(params);
            startTransition(() => {
                // Wrap state updates that might cause significant re-renders
                setProblemsData(data);
                setCurrentPage(data.currentPage > 0 ? data.currentPage : 1);
            });
        } catch (e) {
            startTransition(() => {
                setError(
                    e instanceof Error ? e.message : "An unknown error occurred"
                );
                setProblemsData(null);
            });
        } finally {
            startTransition(() => {
                setIsLoading(false);
            });
        }
    }, []); // No dependencies, relies on passed params

    // Debounced version of setting search term to trigger useEffect
    const debouncedSetAndFetchSearch = useCallback(
        debounce((term: string) => {
            // This will trigger the main useEffect because searchTerm state changes
            // And it will reset page to 1
            startTransition(() => {
                setSearchTerm(term);
                setCurrentPage(1); // Reset page when search term changes
            });
        }, DEBOUNCE_DELAY),
        [] // Debounce function itself doesn't need deps here as it's stable
    );

    // Effect to update URL and trigger data fetching when state changes
    useEffect(() => {
        const params: GetProblemsParams = {
            search: searchTerm.trim(),
            platform: selectedPlatform,
            difficulty: selectedDifficulty,
            tags: selectedTags.filter(Boolean),
            page: currentPage,
            limit: ITEMS_PER_PAGE,
        };

        const currentUrlQuery = new URLSearchParams();
        if (params.search) currentUrlQuery.set("search", params.search);
        if (params.platform) currentUrlQuery.set("platform", params.platform);
        if (params.difficulty)
            currentUrlQuery.set("difficulty", params.difficulty);
        if (params.tags && params.tags.length > 0)
            currentUrlQuery.set("tags", params.tags.join(","));
        if (params.page && params.page > 1)
            currentUrlQuery.set("page", params.page.toString());

        const newQueryString = currentUrlQuery.toString();
        const currentQueryStringInUrl = new URLSearchParams(
            searchParamsHook.toString()
        ).toString();

        // Update URL only if it actually changed
        if (newQueryString !== currentQueryStringInUrl) {
            router.push(`${pathname}?${newQueryString}`, { scroll: false });
        }

        // Fetch data based on the current state which is now reflected in URL (or will be)
        fetchProblemsData(params);
    }, [
        searchTerm,
        selectedPlatform,
        selectedDifficulty,
        selectedTags,
        currentPage,
        fetchProblemsData,
        router,
        pathname,
        searchParamsHook,
    ]);

    // Effect to initialize filters from URL on first load or direct navigation
    useEffect(() => {
        startTransition(() => {
            setSearchTerm(searchParamsHook.get("search") || "");
            setSelectedPlatform(
                (searchParamsHook.get("platform") as ProblemPlatform) || ""
            );
            setSelectedDifficulty(searchParamsHook.get("difficulty") || "");
            setSelectedTags(
                searchParamsHook.get("tags")?.split(",").filter(Boolean) || []
            );
            setCurrentPage(parseInt(searchParamsHook.get("page") || "1", 10));
        });
    }, [searchParamsHook]); // React to direct URL changes

    const handlePageChange = (newPage: number) => {
        if (
            newPage > 0 &&
            newPage <= (problemsData?.totalPages || 1) &&
            newPage !== currentPage
        ) {
            startTransition(() => setCurrentPage(newPage));
        }
    };

    const handleFilterChange = (
        setter: React.Dispatch<React.SetStateAction<any>>,
        value: any
    ) => {
        startTransition(() => {
            setter(value);
            setCurrentPage(1); // Reset to page 1 when any filter (not search) changes
        });
    };

    const handleSearchChange = (term: string) => {
        // setSearchTerm(term); // This would make it non-debounced
        debouncedSetAndFetchSearch(term); // Use the debounced setter
    };

    const handleAddTag = () => {
        const trimmedTag = tagInput.trim().toLowerCase();
        if (trimmedTag && !selectedTags.includes(trimmedTag)) {
            startTransition(() => {
                setSelectedTags((prevTags) => [...prevTags, trimmedTag]);
                setTagInput("");
                setCurrentPage(1);
            });
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        startTransition(() => {
            setSelectedTags((prevTags) =>
                prevTags.filter((tag: string) => tag !== tagToRemove)
            );
            setCurrentPage(1);
        });
    };

    const renderPaginationNumbers = () => {
        // ... (pagination rendering logic remains the same, ensure keys are unique)
        // (Make sure buttons inside this are disabled={isLoading})
        if (!problemsData || problemsData.totalPages <= 1) return null;
        const pageNumbers: (number | string)[] = [];
        const total = problemsData.totalPages;
        const current = currentPage;
        const surround = 1; // Number of pages to show around current page

        if (total <= 7) {
            // Show all if 7 or less
            for (let i = 1; i <= total; i++) pageNumbers.push(i);
        } else {
            pageNumbers.push(1); // First page
            if (current > surround + 2) pageNumbers.push("..."); // Ellipsis after first

            for (
                let i = Math.max(2, current - surround);
                i <= Math.min(total - 1, current + surround);
                i++
            ) {
                pageNumbers.push(i);
            }

            if (current < total - (surround + 1)) pageNumbers.push("..."); // Ellipsis before last
            pageNumbers.push(total); // Last page
        }

        const finalPageNumbers = pageNumbers.filter(
            (item, index, self) =>
                item !== "..." || (item === "..." && self[index - 1] !== "...")
        );

        return finalPageNumbers.map((page, idx) => {
            if (typeof page === "string") {
                return (
                    <span
                        key={`ellipsis-${idx}`}
                        className="text-slate-500 px-1 sm:px-2 self-center"
                    >
                        ...
                    </span>
                );
            }
            return (
                <button
                    key={`page-${page}`}
                    onClick={() => handlePageChange(page)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm transition-colors ${
                        currentPage === page
                            ? "bg-sky-600 text-white font-semibold ring-2 ring-sky-400"
                            : "bg-slate-700/80 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                >
                    {page}
                </button>
            );
        });
    };

    // Show full skeleton if loading and no data exists yet (initial load)
    if (isLoading && !problemsData) {
        return <ProblemsPageContentSkeleton />;
    }

    const mainContentClass = `transition-opacity duration-300 ${
        isLoading ? "opacity-60 cursor-wait pointer-events-auto" : "opacity-100"
    }`;

    return (
        <div
            className={`space-y-8 min-h-screen ${
                isLoading ? "cursor-wait" : ""
            }`}
        >
            <h1 className="text-4xl md:text-5xl font-bold text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-purple-400 py-2">
                    Explore Problems
                </span>
            </h1>

            {/* Filters Section - disable interactions when loading */}
            <div
                className={`sticky top-[70px] z-30 bg-slate-900/80 backdrop-blur-lg p-4 rounded-xl shadow-2xl border border-slate-700/50 mb-8 ${
                    isLoading ? "pointer-events-none opacity-70" : ""
                }`}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div className="relative">
                        <label
                            htmlFor="problem-search"
                            className="text-xs font-medium text-slate-400 mb-1 block"
                        >
                            Search
                        </label>
                        <input
                            id="problem-search"
                            type="text"
                            placeholder="Title, ID, tag..."
                            defaultValue={searchParamsHook.get("search") || ""} // Reflect URL, actual state change is debounced
                            onChange={(e) => handleSearchChange(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 pl-10 bg-slate-700/80 backdrop-blur-sm border border-slate-600/70 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors disabled:cursor-not-allowed"
                        />
                        <FaSearch className="absolute left-3 top-[calc(50%+6px)] -translate-y-1/2 text-slate-400" />
                    </div>
                    <div>
                        <label
                            htmlFor="platform-filter"
                            className="text-xs font-medium text-slate-400 mb-1 block"
                        >
                            Platform
                        </label>
                        <select
                            id="platform-filter"
                            value={selectedPlatform}
                            onChange={(e) =>
                                handleFilterChange(
                                    setSelectedPlatform,
                                    e.target.value as ProblemPlatform | ""
                                )
                            }
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 bg-slate-700/80 backdrop-blur-sm border border-slate-600/70 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors disabled:cursor-not-allowed"
                        >
                            {platformOptions.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="difficulty-filter"
                            className="text-xs font-medium text-slate-400 mb-1 block"
                        >
                            Difficulty
                        </label>
                        <select
                            id="difficulty-filter"
                            value={selectedDifficulty}
                            onChange={(e) =>
                                handleFilterChange(
                                    setSelectedDifficulty,
                                    e.target.value
                                )
                            }
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 bg-slate-700/80 backdrop-blur-sm border border-slate-600/70 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors disabled:cursor-not-allowed"
                        >
                            {difficultyOptions.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-4">
                    <label
                        htmlFor="tag-input"
                        className="text-xs font-medium text-slate-400 mb-1 block"
                    >
                        Tags (press Enter or comma)
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="tag-input"
                            type="text"
                            placeholder="e.g., dp, math"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                    e.preventDefault();
                                    handleAddTag();
                                }
                            }}
                            disabled={isLoading}
                            className="flex-grow px-4 py-2.5 bg-slate-700/80 backdrop-blur-sm border border-slate-600/70 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={handleAddTag}
                            disabled={isLoading}
                            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Add Tag
                        </button>
                    </div>
                    {selectedTags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {selectedTags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/20 text-sky-300 text-xs font-medium rounded-full border border-sky-500/50"
                                >
                                    {tag}
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        disabled={isLoading}
                                        className="text-sky-400 hover:text-white disabled:cursor-not-allowed"
                                    >
                                        <FaTimes size={10} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Problems Display Section */}
            <div className={mainContentClass}>
                {error && (
                    <div className="text-center text-red-400 bg-red-900/30 p-6 rounded-xl border border-red-700/50 shadow-lg">
                        {error}
                    </div>
                )}

                {!error && problemsData && (
                    <>
                        <div className="flex justify-between items-center mb-1 text-sm text-slate-400 px-1">
                            <span>
                                Showing{" "}
                                {problemsData.problems.length > 0
                                    ? (problemsData.currentPage - 1) *
                                          ITEMS_PER_PAGE +
                                      1
                                    : 0}
                                -
                                {Math.min(
                                    problemsData.currentPage * ITEMS_PER_PAGE,
                                    problemsData.totalProblems
                                )}{" "}
                                of {problemsData.totalProblems} problems
                            </span>
                            {isLoading && problemsData.problems.length > 0 && (
                                <FaSpinner className="animate-spin text-sky-400 text-lg" />
                            )}{" "}
                            {/* Spinner during pagination over old data */}
                        </div>

                        {problemsData.problems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                                {problemsData.problems.map(
                                    (problem: UnifiedProblem) => (
                                        <ProblemCard
                                            key={problem.id}
                                            problem={problem}
                                        />
                                    )
                                )}
                            </div>
                        ) : (
                            !isLoading && (
                                <p className="text-center text-slate-400 py-16 text-lg">
                                    No problems found matching your criteria.
                                </p>
                            )
                        )}

                        {problemsData.totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-1 sm:space-x-2 pt-10 pb-6">
                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage <= 1 || isLoading}
                                    className="px-3 py-2 sm:px-4 bg-slate-700/80 hover:bg-sky-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-colors"
                                >
                                    <FaAngleLeft size={12} /> Previous
                                </button>
                                {renderPaginationNumbers()}
                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    disabled={
                                        currentPage >=
                                            problemsData.totalPages || isLoading
                                    }
                                    className="px-3 py-2 sm:px-4 bg-slate-700/80 hover:bg-sky-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-colors"
                                >
                                    Next <FaAngleRight size={12} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function ProblemsPageContainer() {
    return (
        // Suspense is good for code splitting and initial loading handled by Next.js Navigation
        <Suspense fallback={<ProblemsPageContentSkeleton />}>
            <ProblemsPageContent />
        </Suspense>
    );
}
