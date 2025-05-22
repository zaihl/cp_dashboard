// app/problems/loading.tsx
// This file will be automatically used by Next.js when navigating to /problems

// We can reuse the skeleton defined within ProblemsPage.tsx or define a similar one here.
// For simplicity and to keep it co-located, the skeleton is defined within ProblemsPage.tsx itself
// and conditionally rendered. This loading.tsx can provide an even simpler, page-level fallback
// if the main component itself is code-split or has other Suspense boundaries.

// For a route-level skeleton (this file), it should be simpler:
export default function ProblemsLoading() {
    return (
        <div className="space-y-8 min-h-screen animate-pulse">
            {/* Page Title Skeleton */}
            <div className="flex justify-center py-4 mt-4">
                <div className="h-10 md:h-12 w-3/5 md:w-1/2 bg-slate-700 rounded-md"></div>
            </div>

            {/* Filters Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-slate-800/50 rounded-xl">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-slate-700 rounded-md"></div>
                ))}
            </div>

            {/* Placeholder for problem count text */}
            <div className="h-6 bg-slate-700 rounded w-1/3 mx-auto mb-4"></div>

            {/* Problem Cards Skeleton Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                {[...Array(12)].map(
                    (
                        _,
                        i // Show 12 skeleton cards
                    ) => (
                        <div
                            key={i}
                            className="h-40 bg-slate-800/70 border border-slate-700/50 rounded-xl p-4 space-y-3"
                        >
                            <div className="h-5 bg-slate-700 rounded w-3/4"></div>{" "}
                            {/* Title */}
                            <div className="flex justify-between">
                                <div className="h-4 bg-slate-700 rounded w-1/4"></div>{" "}
                                {/* Difficulty */}
                                <div className="h-4 bg-slate-700 rounded w-1/4"></div>{" "}
                                {/* Platform */}
                            </div>
                            <div className="flex gap-1">
                                <div className="h-3 bg-slate-700 rounded-full w-10"></div>{" "}
                                {/* Tag */}
                                <div className="h-3 bg-slate-700 rounded-full w-12"></div>{" "}
                                {/* Tag */}
                            </div>
                            <div className="h-4 bg-slate-700 rounded w-1/3 mt-auto"></div>{" "}
                            {/* Link */}
                        </div>
                    )
                )}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex justify-center items-center space-x-2 pt-10 pb-6">
                <div className="h-9 w-24 bg-slate-700 rounded-md"></div>
                <div className="h-9 w-9 bg-slate-700 rounded-md"></div>
                <div className="h-9 w-9 bg-slate-700 rounded-md"></div>
                <div className="h-9 w-9 bg-slate-700 rounded-md"></div>
                <div className="h-9 w-24 bg-slate-700 rounded-md"></div>
            </div>
        </div>
    );
}
