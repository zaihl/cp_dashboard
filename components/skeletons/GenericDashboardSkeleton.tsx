// app/components/skeletons/GenericDashboardSkeleton.tsx
import SkeletonElement from "./SkeletonElement";

export default function GenericDashboardSkeleton() {
    const sectionClasses =
        "bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-6 md:p-8";
    const sectionTitleClasses = "mb-6 pb-4"; // SkeletonElement will handle height/width

    return (
        <div className="space-y-10 animate-pulse">
            {" "}
            {/* Outer animate-pulse not strictly needed if inner elements have it, but can help with perception */}
            {/* Page Title Skeleton */}
            <div className="flex justify-center py-4">
                <SkeletonElement
                    type="title"
                    className="h-10 md:h-12 w-3/5 md:w-1/2"
                />
            </div>
            {/* User Info Block Skeleton (Avatar + Name/Rank lines) */}
            <div className="flex flex-col md:flex-row items-center text-center md:text-left space-y-4 md:space-y-0 md:space-x-6 p-4">
                <SkeletonElement
                    type="avatar"
                    className="w-24 h-24 md:w-32 md:h-32"
                />
                <div className="space-y-3">
                    <SkeletonElement type="text" className="h-7 w-48" />{" "}
                    {/* Name */}
                    <SkeletonElement type="text" className="h-5 w-32" />{" "}
                    {/* Rank/Rating */}
                    <SkeletonElement type="text" className="h-4 w-40" />{" "}
                    {/* Sub-info */}
                </div>
            </div>
            {/* Section 1: Grid of Stat Cards Skeleton */}
            <section className={sectionClasses}>
                <SkeletonElement
                    type="title"
                    className={`${sectionTitleClasses} h-7 w-1/3`}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={`stat-${i}`}
                            className="bg-slate-700/60 backdrop-blur-sm border border-slate-600/50 rounded-xl p-5 shadow-lg text-center space-y-2"
                        >
                            <SkeletonElement
                                type="text"
                                className="h-4 w-20 mx-auto"
                            />{" "}
                            {/* Label */}
                            <SkeletonElement
                                type="text"
                                className="h-8 w-16 mx-auto"
                            />{" "}
                            {/* Value */}
                        </div>
                    ))}
                </div>
            </section>
            {/* Section 2: Table Skeleton */}
            <section className={sectionClasses}>
                <SkeletonElement
                    type="title"
                    className={`${sectionTitleClasses} h-7 w-2/5`}
                />
                <div className="overflow-x-auto rounded-lg border border-slate-700/80">
                    <div className="min-w-full">
                        {/* Table Header Skeleton */}
                        <div className="bg-slate-700/80 backdrop-blur-sm flex">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={`th-${i}`}
                                    className="px-6 py-4 flex-1"
                                >
                                    <SkeletonElement
                                        type="text"
                                        className="h-4 w-3/4"
                                    />
                                </div>
                            ))}
                        </div>
                        {/* Table Body Skeleton Rows */}
                        <div className="divide-y divide-slate-700/80">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={`row-${i}`}
                                    className="flex hover:bg-slate-700/50 transition-colors duration-150"
                                >
                                    {[1, 2, 3, 4].map((j) => (
                                        <div
                                            key={`cell-${i}-${j}`}
                                            className="px-6 py-5 flex-1"
                                        >
                                            {" "}
                                            {/* Increased py for row height */}
                                            <SkeletonElement
                                                type="text"
                                                className="h-4 w-full"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            {/* Section 3: Different Content Block Skeleton (e.g., for Heatmap/List) */}
            <section className={sectionClasses}>
                <SkeletonElement
                    type="title"
                    className={`${sectionTitleClasses} h-7 w-1/2`}
                />
                <SkeletonElement type="block" className="h-40 md:h-48 w-full" />{" "}
                {/* For iframe or larger content block */}
            </section>
        </div>
    );
}
