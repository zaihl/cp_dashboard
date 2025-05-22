/* eslint-disable @typescript-eslint/no-unused-vars */
// app/components/dashboards/AtCoderDashboard.tsx
import type { AtCoderUserProfile } from "@/lib/types"; // Ensure this path is correct
import { formatDistanceToNowStrict } from "date-fns";

// Consistent StatCard (can be moved to a shared component file)
interface StatCardProps {
    label: string;
    value: string | number | null | undefined;
    className?: string;
    subLabel?: string; // e.g., for rank
}

const StatCard = ({
    label,
    value,
    className = "",
    subLabel,
}: StatCardProps) => (
    <div
        className={`bg-slate-700/60 backdrop-blur-sm border border-slate-600/50 rounded-xl p-5 shadow-lg text-center transition-all hover:scale-105 hover:shadow-cyan-500/30 ${className}`}
    >
        <h3 className="text-sm font-medium text-slate-400">{label}</h3>
        <p className="text-3xl font-bold text-cyan-300 mt-1.5">
            {value ?? "N/A"}
        </p>
        {subLabel && (
            <p className="text-xs text-slate-500 mt-0.5">{subLabel}</p>
        )}
    </div>
);

interface Props {
    data: AtCoderUserProfile;
    username: string; // This is the handle
}

export default function AtCoderDashboard({ data, username }: Props) {
    const {
        handle,
        acceptedCount,
        acceptedCountRank,
        ratedPointSum,
        ratedPointSumRank,
        recentSubmissions,
    } = data;

    return (
        <div className="space-y-10">
            <div className="text-center p-4">
                <h1 className="text-4xl md:text-5xl font-bold">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">
                        AtCoder: {handle}
                    </span>
                </h1>
            </div>

            {/* Key Statistics */}
            <section className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2 border-cyan-500/40 text-cyan-300">
                    User Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard
                        label="Problems Solved (AC)"
                        value={acceptedCount ?? "N/A"}
                        subLabel={
                            acceptedCountRank
                                ? `Rank: ${acceptedCountRank}`
                                : undefined
                        }
                    />
                    <StatCard
                        label="Rated Point Sum"
                        value={ratedPointSum ?? "N/A"}
                        subLabel={
                            ratedPointSumRank
                                ? `Rank: ${ratedPointSumRank}`
                                : undefined
                        }
                    />
                    {/* You can add more StatCards here if you fetch streak_rank or language_rank */}
                </div>
                {acceptedCountRank === undefined &&
                    ratedPointSumRank === undefined &&
                    acceptedCount !== undefined && (
                        <p className="text-xs text-slate-500 mt-4 text-center">
                            Specific rank data for AC count and Rated Point Sum
                            might require parsing global ranking lists.
                            Displaying total values.
                        </p>
                    )}
            </section>

            {/* Recent Submissions */}
            <section className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2 border-purple-500/40 text-purple-300">
                    Recent Submissions
                </h2>
                {recentSubmissions.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-700/80 max-h-[600px]">
                        <table className="min-w-full">
                            <thead className="bg-slate-700/80 backdrop-blur-sm sticky top-0">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                                    >
                                        Problem
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                                    >
                                        Verdict
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                                    >
                                        Points
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                                    >
                                        Lang
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                                    >
                                        Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/80">
                                {recentSubmissions.map((sub) => (
                                    <tr
                                        key={sub.id}
                                        className="hover:bg-slate-700/50 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">
                                            <a
                                                href={`https://atcoder.jp/contests/${sub.contestId}/submissions/${sub.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-purple-400 hover:text-purple-300 hover:underline"
                                                title={`View submission for ${sub.problemId} in ${sub.contestId}`}
                                            >
                                                {sub.problemId} ({sub.contestId}
                                                )
                                            </a>
                                        </td>
                                        <td
                                            className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                                                sub.verdict === "AC"
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                            }`}
                                        >
                                            {sub.verdict}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                            {sub.points}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                            {sub.language}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                            {formatDistanceToNowStrict(
                                                new Date(
                                                    sub.submittedAtSeconds *
                                                        1000
                                                ),
                                                { addSuffix: true }
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center py-8 text-slate-400">
                        No recent submissions found.
                    </p>
                )}
            </section>
            {/* Contest History section is removed as we don't have direct non-deprecated API for it */}
        </div>
    );
}
