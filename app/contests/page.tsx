/* eslint-disable react-hooks/exhaustive-deps */
// app/contests/page.tsx
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    getContests,
    ContestsApiResponse,
    GetContestsParams, // Ensure this type from lib/api.ts or lib/types.ts includes `page?: number;`
} from "@/lib/api";
import {
    FaExternalLinkAlt,
    FaAngleLeft,
    FaAngleRight,
    FaSpinner,
} from "react-icons/fa";
import { format, parseISO, formatDuration, intervalToDuration } from "date-fns";
import { UnifiedContest } from "@/lib/types";

const ITEMS_PER_PAGE = 20;

const platformFilterOptions = [
    // value should match the resource names CLIST.by expects for filtering,
    // or what your backend /api/contests route maps to CLIST.by resource IDs/hostnames.
    // Using hostnames here as per previous setup.
    { label: "All Platforms", value: "" }, // Special value for no platform filter
    { label: "LeetCode", value: "leetcode.com" },
    { label: "Codeforces", value: "codeforces.com" },
    { label: "CodeChef", value: "codechef.com" },
    { label: "AtCoder", value: "atcoder.jp" },
    { label: "TopCoder", value: "topcoder.com" },
];

// Define the default platforms you want selected
const defaultSelectedResourceValues: string[] = [
    "leetcode.com",
    "codeforces.com",
    "codechef.com",
];

// --- ContestCard and ContestsPageSkeleton components remain the same as your provided code ---
const ContestCard = ({ contest }: { contest: UnifiedContest }) => {
    const startTime = parseISO(contest.start);
    const endTime = parseISO(contest.end);
    const durationSeconds = contest.duration;
    const durationObj = intervalToDuration({
        start: 0,
        end: durationSeconds * 1000,
    });
    let status = "";
    let statusColor = "text-slate-400";
    const now = new Date();

    if (startTime > now) {
        status = "Upcoming";
        statusColor = "text-sky-400";
    } else if (endTime < now) {
        status = "Past";
        statusColor = "text-slate-500";
    } else {
        status = "Live";
        statusColor = "text-red-500 animate-pulse";
    }

    return (
        <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-lg p-4 hover:shadow-purple-500/20 transition-shadow duration-200 flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <h3
                    className="text-md font-semibold text-purple-300 transition-colors hover:text-purple-200 flex-1 mr-2 truncate"
                    title={contest.event}
                >
                    <a
                        href={contest.href}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {contest.event}
                    </a>
                </h3>
                <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor} bg-slate-700 border border-slate-600`}
                >
                    {status}
                </span>
            </div>
            <p className="text-xs text-slate-400 mb-1">
                <span className="font-medium">
                    {contest.platformDisplayName || contest.host}
                </span>
            </p>
            <p className="text-xs text-slate-300 mb-1">
                <span className="font-semibold">Starts:</span>{" "}
                {format(startTime, "MMM d, yyyy 'at' h:mm a")}
            </p>
            <p className="text-xs text-slate-300 mb-3">
                <span className="font-semibold">Duration:</span>{" "}
                {formatDuration(durationObj, {
                    format: ["hours", "minutes"],
                }) || `${durationSeconds}s`}
            </p>
            <a
                href={contest.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto self-start text-xs text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1.5 pt-1"
            >
                View Contest <FaExternalLinkAlt size={10} />
            </a>
        </div>
    );
};

const ContestsPageSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-800/50 rounded-xl">
            {[...Array(2)].map((_, i) => (
                <div
                    key={`filter-skeleton-${i}`}
                    className="h-10 bg-slate-700 rounded-md"
                ></div>
            ))}
        </div>
        <div className="h-6 bg-slate-700 rounded w-1/3 mx-auto mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(9)].map((_, i) => (
                <div
                    key={`contest-card-skeleton-${i}`}
                    className="h-44 bg-slate-800/70 border border-slate-700/50 rounded-xl p-4 space-y-3"
                >
                    <div className="flex justify-between">
                        <div className="h-5 bg-slate-700 rounded w-3/5"></div>
                        <div className="h-4 bg-slate-700 rounded w-1/5"></div>
                    </div>
                    <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/4 mt-auto"></div>
                </div>
            ))}
        </div>
        <div className="flex justify-center items-center space-x-2 pt-8">
            <div className="h-9 w-24 bg-slate-700 rounded-md"></div>
            <div className="h-9 w-9 bg-slate-700 rounded-md"></div>
            <div className="h-9 w-9 bg-slate-700 rounded-md"></div>
            <div className="h-9 w-24 bg-slate-700 rounded-md"></div>
        </div>
    </div>
);
// --- End of Skeleton & Card ---

type ContestFilterType = "upcoming" | "past" | "all";

function ContestsPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParamsHook = useSearchParams();

    const [contestData, setContestData] = useState<ContestsApiResponse | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize state from URL search params, with defaults for resources
    const [contestFilter, setContestFilter] = useState<ContestFilterType>(
        () =>
            (searchParamsHook.get("filter") as ContestFilterType) || "upcoming"
    );
    const [selectedResources, setSelectedResources] = useState<string[]>(() => {
        const resourcesFromUrl = searchParamsHook.get("resources");
        return resourcesFromUrl
            ? resourcesFromUrl.split(",").filter(Boolean)
            : defaultSelectedResourceValues;
    });
    const [currentPage, setCurrentPage] = useState<number>(() =>
        parseInt(searchParamsHook.get("page") || "1", 10)
    );

    // Memoized fetch function
    const fetchContestData = useCallback(
        async (params: GetContestsParams, isHardRefresh: boolean) => {
            setIsLoading(true);
            if (isHardRefresh) {
                setContestData(null); // Clear previous data to show full skeleton
            }
            setError(null);
            try {
                const apiParams: GetContestsParams = {
                    ...params,
                    limit: params.limit || ITEMS_PER_PAGE,
                };
                // Backend /api/contests expects 'page' (which it converts to offset for CLIST)

                const data = await getContests(apiParams);
                setContestData(data);
                // Sync local currentPage with what API returns or the requested page
                setCurrentPage(params.page || 1);
            } catch (e) {
                setError(
                    e instanceof Error ? e.message : "An unknown error occurred"
                );
                setContestData(null);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Effect to react to state changes and update URL / fetch data
    useEffect(() => {
        const isFilterChange =
            (searchParamsHook.get("filter") || "upcoming") !== contestFilter ||
            (searchParamsHook.get("resources") ||
                defaultSelectedResourceValues.join(",")) !==
                selectedResources.join(",");

        const pageToFetch = isFilterChange ? 1 : currentPage;

        const paramsForApi: GetContestsParams = {
            filter: contestFilter,
            resources: selectedResources.join(","),
            page: pageToFetch, // Use potentially reset page
            limit: ITEMS_PER_PAGE,
        };
        if (contestFilter === "upcoming") paramsForApi.upcoming = true;
        if (contestFilter === "past") paramsForApi.past = true;

        const currentUrlQuery = new URLSearchParams();
        if (contestFilter !== "upcoming")
            currentUrlQuery.set("filter", contestFilter);

        // Only add 'resources' to URL if it's not the default state OR if it was initially in URL
        const resourcesFromUrlInitial = searchParamsHook.get("resources");
        if (selectedResources.length > 0) {
            if (
                resourcesFromUrlInitial !== null ||
                selectedResources.join(",") !==
                    defaultSelectedResourceValues.join(",")
            ) {
                currentUrlQuery.set("resources", selectedResources.join(","));
            }
        } else if (resourcesFromUrlInitial !== null) {
            // If selectedResources is empty but was in URL, remove it
            currentUrlQuery.delete("resources");
        }

        if (pageToFetch > 1)
            currentUrlQuery.set("page", pageToFetch.toString());

        const newQueryString = currentUrlQuery.toString();
        const currentQueryStringInUrl = new URLSearchParams(
            searchParamsHook.toString()
        ).toString();

        if (newQueryString !== currentQueryStringInUrl) {
            router.push(`${pathname}?${newQueryString}`, { scroll: false });
        }

        // Fetch data. Determine if it's a hard refresh (filters changed or page reset to 1)
        // The `WorkspaceContestData` function itself will handle `setContestData(null)` if it's a hard refresh.
        fetchContestData(
            paramsForApi,
            isFilterChange || (pageToFetch === 1 && currentPage !== 1)
        );
    }, [
        contestFilter,
        selectedResources,
        currentPage,
        searchParamsHook,
        router,
        pathname,
        fetchContestData,
    ]);

    // Effect to initialize state from URL when searchParamsHook changes (e.g., direct navigation, back/forward)
    useEffect(() => {
        const filterFromUrl =
            (searchParamsHook.get("filter") as ContestFilterType) || "upcoming";
        const resourcesFromUrlString = searchParamsHook.get("resources");
        const resourcesFromUrl =
            resourcesFromUrlString !== null // Check if param exists
                ? resourcesFromUrlString.split(",").filter(Boolean)
                : defaultSelectedResourceValues; // Apply default if param is absent
        const pageFromUrl = parseInt(searchParamsHook.get("page") || "1", 10);

        // Sync UI driving states only if they differ from URL, to avoid loops
        if (filterFromUrl !== contestFilter) setContestFilter(filterFromUrl);
        if (resourcesFromUrl.join(",") !== selectedResources.join(","))
            setSelectedResources(resourcesFromUrl);
        if (pageFromUrl !== currentPage) setCurrentPage(pageFromUrl);
    }, [searchParamsHook]);

    const handlePageChange = (newPage: number) => {
        const totalPages = contestData?.meta
            ? Math.ceil(
                  contestData.meta.total_count /
                      (contestData.meta.limit || ITEMS_PER_PAGE)
              )
            : 1;
        if (newPage > 0 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage); // This will trigger the main useEffect
        }
    };

    const handlePlatformToggle = (platformValue: string) => {
        setSelectedResources((prev) => {
            const newSelected = prev.includes(platformValue)
                ? prev.filter((p) => p !== platformValue)
                : [...prev, platformValue];
            // setCurrentPage(1); // Page reset is handled by main useEffect logic now
            return newSelected;
        });
        setCurrentPage(1); // Explicitly reset page for this action
    };

    const handleFilterTypeChange = (newFilter: ContestFilterType) => {
        setContestFilter(newFilter);
        setCurrentPage(1); // Explicitly reset page
    };

    const renderPaginationNumbers = () => {
        // ... (Pagination rendering logic - same as your version, ensure keys are unique) ...
        if (!contestData || !contestData.meta) return null;
        const totalPages = Math.ceil(
            contestData.meta.total_count /
                (contestData.meta.limit || ITEMS_PER_PAGE)
        );
        if (totalPages <= 1) return null;

        const pageNumbers: (number | string)[] = [];
        const current = currentPage;
        const surround = 1;

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            pageNumbers.push(1);
            if (current > surround + 2) pageNumbers.push("...");
            for (
                let i = Math.max(2, current - surround);
                i <= Math.min(totalPages - 1, current + surround);
                i++
            ) {
                pageNumbers.push(i);
            }
            if (current < totalPages - (surround + 1)) pageNumbers.push("...");
            pageNumbers.push(totalPages);
        }

        const finalPageNumbers = pageNumbers.filter(
            (item, index, self) =>
                item !== "..." || (item === "..." && self[index - 1] !== "...")
        );

        return finalPageNumbers.map((page, idx) => {
            const uniqueKey =
                typeof page === "string"
                    ? `ellipsis-${idx}-${Math.random()}`
                    : `page-${page}`; // Ensure unique keys for ellipsis
            if (typeof page === "string") {
                return (
                    <span
                        key={uniqueKey}
                        className="text-slate-500 px-1 sm:px-2 self-center"
                    >
                        ...
                    </span>
                );
            }
            return (
                <button
                    key={uniqueKey}
                    onClick={() => handlePageChange(page)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm transition-colors ${
                        current === page
                            ? "bg-purple-600 text-white font-semibold ring-2 ring-purple-400"
                            : "bg-slate-700/80 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                >
                    {page}
                </button>
            );
        });
    };

    const showFullSkeleton = isLoading && !contestData;
    const showContentDimmed =
        isLoading && contestData && contestData.contests.length > 0;

    return (
        <div
            className={`space-y-8 min-h-screen ${
                isLoading ? "cursor-wait" : ""
            }`}
        >
            <h1 className="text-4xl md:text-5xl font-bold text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 py-2">
                    Competitive Programming Contests
                </span>
            </h1>

            <div
                className={`sticky top-[70px] z-30 bg-slate-900/80 backdrop-blur-lg p-4 rounded-xl shadow-2xl border border-slate-700/50 mb-8 ${
                    isLoading ? "pointer-events-none opacity-70" : ""
                }`}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                        <label
                            htmlFor="contest-type-filter"
                            className="text-xs font-medium text-slate-400 mb-1 block"
                        >
                            Show Contests
                        </label>
                        <select
                            id="contest-type-filter"
                            value={contestFilter}
                            onChange={(e) =>
                                handleFilterTypeChange(
                                    e.target.value as ContestFilterType
                                )
                            }
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 bg-slate-700/80 backdrop-blur-sm border border-slate-600/70 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors disabled:cursor-not-allowed"
                        >
                            <option value="upcoming">Upcoming</option>
                            <option value="past">Past</option>
                            <option value="all">All</option>
                        </select>
                    </div>
                    <div>
                        <span className="text-xs font-medium text-slate-400 mb-1 block">
                            Platforms
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {platformFilterOptions.map(
                                (opt) =>
                                    opt.value && (
                                        <button
                                            key={opt.value}
                                            onClick={() =>
                                                handlePlatformToggle(opt.value)
                                            }
                                            disabled={isLoading}
                                            className={`px-3 py-1.5 text-xs rounded-full border transition-colors disabled:cursor-not-allowed ${
                                                selectedResources.includes(
                                                    opt.value
                                                )
                                                    ? "bg-purple-500/80 border-purple-400 text-white font-semibold"
                                                    : "bg-slate-700/70 border-slate-600 text-slate-300 hover:bg-slate-600/90 hover:border-slate-500"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showFullSkeleton && <ContestsPageSkeleton />}
            {error && (
                <div className="text-center text-red-400 bg-red-900/30 p-6 rounded-xl border border-red-700/50 shadow-lg">
                    {error}
                </div>
            )}

            {!error && contestData && (
                <>
                    <div className="flex justify-between items-center mb-1 text-sm text-slate-400 px-1">
                        <span>
                            Showing{" "}
                            {contestData.contests.length > 0
                                ? (currentPage - 1) * ITEMS_PER_PAGE + 1
                                : 0}
                            -
                            {Math.min(
                                currentPage * ITEMS_PER_PAGE,
                                contestData.meta?.total_count || 0
                            )}{" "}
                            of {contestData.meta?.total_count || 0} contests
                        </span>
                        {isLoading && contestData.contests.length > 0 && (
                            <FaSpinner className="animate-spin text-purple-400 text-lg" />
                        )}
                    </div>

                    {contestData.contests.length > 0 ? (
                        <div
                            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 ${
                                showContentDimmed
                                    ? "opacity-60 pointer-events-none"
                                    : ""
                            }`}
                        >
                            {contestData.contests.map(
                                (contest: UnifiedContest) => (
                                    <ContestCard
                                        key={contest.id}
                                        contest={contest}
                                    />
                                )
                            )}
                        </div>
                    ) : (
                        !isLoading && (
                            <p className="text-center text-slate-400 py-16 text-lg">
                                No contests found for the selected criteria.
                            </p>
                        )
                    )}

                    {contestData.meta &&
                        Math.ceil(
                            contestData.meta.total_count /
                                (contestData.meta.limit || ITEMS_PER_PAGE)
                        ) > 1 && (
                            <div className="flex justify-center items-center space-x-1 sm:space-x-2 pt-10 pb-6">
                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage <= 1 || isLoading}
                                    className="px-3 py-2 sm:px-4 bg-slate-700/80 hover:bg-purple-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-colors"
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
                                            Math.ceil(
                                                contestData.meta.total_count /
                                                    (contestData.meta.limit ||
                                                        ITEMS_PER_PAGE)
                                            ) || isLoading
                                    }
                                    className="px-3 py-2 sm:px-4 bg-slate-700/80 hover:bg-purple-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-colors"
                                >
                                    Next <FaAngleRight size={12} />
                                </button>
                            </div>
                        )}
                </>
            )}
            {!isLoading &&
                !error &&
                !contestData /* Case where initial fetch leads to no data or error handled it already */ && (
                    <p className="text-center text-slate-400 py-16 text-lg">
                        Loading contest information...
                    </p>
                )}
        </div>
    );
}

export default function ContestsPageContainer() {
    return (
        <Suspense fallback={<ContestsPageSkeleton />}>
            <ContestsPageContent />
        </Suspense>
    );
}
