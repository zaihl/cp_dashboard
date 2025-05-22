// app/components/dashboards/CodeforcesDashboard.tsx
import type { CodeforcesUserProfile } from "@/lib/types";
import { format, formatDistanceToNowStrict } from "date-fns";
import Image from "next/image";

interface StatCardProps {
    // Re-defined or imported from a shared components file
    label: string;
    value: string | number | null | undefined;
    className?: string;
    subValue?: string;
}

const StatCard = ({
    label,
    value,
    className = "",
    subValue,
}: StatCardProps) => (
    <div
        className={`bg-slate-700/60 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4 shadow-lg text-center transition-all hover:scale-105 hover:shadow-sky-500/30 ${className}`}
    >
        <h3 className="text-sm font-medium text-slate-400">{label}</h3>
        <p className="text-2xl font-semibold text-sky-300 mt-1">
            {value ?? "N/A"}
        </p>
        {subValue && <p className="text-xs text-slate-400">{subValue}</p>}
    </div>
);

interface Props {
    data: CodeforcesUserProfile;
    username: string;
}

export default function CodeforcesDashboard({ data, username }: Props) {
    const { userInfo, userSubmissions, userRatingChanges } = data;

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row items-center text-center md:text-left space-y-4 md:space-y-0 md:space-x-6 p-4">
                <Image
                    src={userInfo.avatar}
                    alt={`${username}'s avatar`}
                    width={128} // Increased size
                    height={128}
                    className="rounded-full border-4 border-sky-500/70 shadow-xl"
                    priority
                />
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                            Codeforces: {userInfo.handle}
                        </span>
                    </h1>
                    <p
                        className={`text-2xl font-semibold mt-1 ${
                            userInfo.rank.toLowerCase().includes("grandmaster")
                                ? "text-red-400"
                                : userInfo.rank.toLowerCase().includes("master")
                                ? "text-orange-400"
                                : "text-purple-400"
                        }`}
                    >
                        {userInfo.rank} ({userInfo.rating})
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        Max: {userInfo.maxRank} ({userInfo.maxRating})
                    </p>
                </div>
            </div>

            {/* Profile Details */}
            <section className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2 border-indigo-500/40 text-indigo-300">
                    Profile Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        label="Contribution"
                        value={userInfo.contribution}
                        className="hover:shadow-indigo-500/30"
                    />
                    <StatCard
                        label="Country"
                        value={userInfo.country || "N/A"}
                        className="hover:shadow-indigo-500/30"
                    />
                    <StatCard
                        label="Organization"
                        value={userInfo.organization || "N/A"}
                        className="hover:shadow-indigo-500/30"
                    />
                    <StatCard
                        label="Friend of"
                        value={`${userInfo.friendOfCount} users`}
                        className="hover:shadow-indigo-500/30"
                    />
                    <StatCard
                        label="Registered"
                        value={formatDistanceToNowStrict(
                            new Date(userInfo.registrationTimeSeconds * 1000),
                            { addSuffix: true }
                        )}
                        className="hover:shadow-indigo-500/30"
                    />
                    <StatCard
                        label="Last Online"
                        value={formatDistanceToNowStrict(
                            new Date(userInfo.lastOnlineTimeSeconds * 1000),
                            { addSuffix: true }
                        )}
                        className="hover:shadow-indigo-500/30"
                    />
                </div>
            </section>

            {/* Recent Submissions */}
            <section className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2 border-green-500/40 text-green-300">
                    Recent Submissions
                </h2>
                <div className="overflow-x-auto rounded-lg border border-slate-700/80">
                    <table className="min-w-full">
                        <thead className="bg-slate-700/80 backdrop-blur-sm">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                                >
                                    Problem (Rating)
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
                                    Language
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
                            {userSubmissions.slice(0, 10).map((sub) => (
                                <tr
                                    key={sub.id}
                                    className="hover:bg-slate-700/50 transition-colors duration-150"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">
                                        <a
                                            href={
                                                sub.problem.contestId
                                                    ? `https://codeforces.com/contest/${sub.problem.contestId}/problem/${sub.problem.index}`
                                                    : "#"
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-400 hover:text-green-300 hover:underline"
                                        >
                                            {sub.problem.name}{" "}
                                            {sub.problem.rating && (
                                                <span className="text-slate-400">
                                                    ({sub.problem.rating})
                                                </span>
                                            )}
                                        </a>
                                    </td>
                                    <td
                                        className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                                            sub.verdict === "OK"
                                                ? "text-green-400"
                                                : sub.verdict
                                                ? "text-red-400"
                                                : "text-yellow-400"
                                        }`}
                                    >
                                        {sub.verdict || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        {sub.programmingLanguage}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {format(
                                            new Date(
                                                sub.creationTimeSeconds * 1000
                                            ),
                                            "PPp"
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {userSubmissions.length === 0 && (
                    <p className="text-center py-8 text-slate-400">
                        No recent submissions found.
                    </p>
                )}
            </section>

            {/* Rating History */}
            <section className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2 border-amber-500/40 text-amber-300">
                    Rating History
                </h2>
                {userRatingChanges.length > 0 ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {" "}
                        {/* Added custom-scrollbar if you have one */}
                        {userRatingChanges.slice(0, 20).map(
                            (
                                change // Show latest 20
                            ) => (
                                <div
                                    key={
                                        change.contestId +
                                        "-" +
                                        change.ratingUpdateTimeSeconds
                                    }
                                    className="p-4 bg-slate-700/60 backdrop-blur-sm border border-slate-600/50 rounded-lg shadow-md hover:border-amber-500/50 transition-colors"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-semibold text-amber-400 text-md">
                                            {change.contestName}
                                        </h4>
                                        <span className="text-xs text-slate-400">
                                            {format(
                                                new Date(
                                                    change.ratingUpdateTimeSeconds *
                                                        1000
                                                ),
                                                "MMM d, yyyy"
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-300">
                                            Rank:{" "}
                                            <span className="font-semibold">
                                                {change.rank}
                                            </span>
                                        </span>
                                        <div className="font-bold">
                                            <span className="text-slate-400">
                                                {change.oldRating}
                                            </span>{" "}
                                            → {}
                                            <span
                                                className={`${
                                                    change.newRating >=
                                                    change.oldRating
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                }`}
                                            >
                                                {change.newRating} (
                                                {change.newRating -
                                                    change.oldRating >=
                                                0
                                                    ? "+"
                                                    : ""}
                                                {change.newRating -
                                                    change.oldRating}
                                                )
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <p className="text-center py-8 text-slate-400">
                        No rating changes found.
                    </p>
                )}
            </section>
        </div>
    );
}
