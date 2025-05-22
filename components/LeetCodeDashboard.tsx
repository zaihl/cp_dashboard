/* eslint-disable @typescript-eslint/no-unused-vars */
// app/components/dashboards/LeetCodeDashboard.tsx
import type { LeetCodeUserProfile } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface StatCardProps {
    label: string;
    value: string | number | null | undefined;
    className?: string;
    icon?: React.ReactNode; // Optional icon
}

const StatCard = ({ label, value, className = "", icon }: StatCardProps) => (
    <div
        className={`bg-slate-700/60 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4 shadow-lg text-center transition-all hover:scale-105 hover:shadow-sky-500/30 ${className}`}
    >
        {icon && (
            <div className="text-sky-400 mb-2 text-2xl mx-auto w-fit">
                {icon}
            </div>
        )}
        <h3 className="text-sm font-medium text-slate-400">{label}</h3>
        <p className="text-2xl font-semibold text-sky-300 mt-1">
            {value ?? "N/A"}
        </p>
    </div>
);

interface Props {
    data: LeetCodeUserProfile;
    username: string;
}

export default function LeetCodeDashboard({ data, username }: Props) {
    const { userData, userContests, userSubmissions } = data;

    // Example icons (using simple text, replace with actual SVG icons if desired)
    // const RankIcon = () => <span>🏆</span>;
    // const ReputationIcon = () => <span>⭐</span>;
    // const ContestIcon = () => <span>📊</span>;

    return (
        <div className="space-y-10">
            {" "}
            {/* Increased spacing */}
            <h1 className="text-4xl md:text-5xl font-bold text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300 py-2">
                    LeetCode: {userData.username}
                </span>
            </h1>
            {/* Profile Overview */}
            <section className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2 border-sky-500/40 text-sky-300">
                    Profile Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard label="Real Name" value={userData.realName} />
                    <StatCard
                        label="Ranking"
                        value={userData.ranking.toLocaleString()}
                    />
                    <StatCard
                        label="Reputation"
                        value={userData.reputation.toLocaleString()}
                    />
                    <StatCard label="Country" value={userData.countryName} />
                    <StatCard label="Company" value={userData.company} />
                    <StatCard label="School" value={userData.school} />
                </div>
                {userData.websites && userData.websites.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-700/50">
                        <h4 className="font-semibold text-slate-300 text-lg mb-2">
                            Websites:
                        </h4>
                        <ul className="space-y-1">
                            {userData.websites.map((site, i) => (
                                <li key={i}>
                                    <a
                                        href={site}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sky-400 hover:text-sky-300 hover:underline transition-colors text-sm"
                                    >
                                        {site}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {userData.aboutMe && (
                    <div className="mt-6 pt-4 border-t border-slate-700/50">
                        <h4 className="font-semibold text-slate-300 text-lg mb-2">
                            About:
                        </h4>
                        <p className="text-slate-300 whitespace-pre-line text-sm leading-relaxed">
                            {userData.aboutMe}
                        </p>
                    </div>
                )}
            </section>
            {/* Submission Stats */}
            <section className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2 border-teal-500/40 text-teal-300">
                    {" "}
                    {/* Different accent */}
                    Submission Stats
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {userData.totalSubmissionsNum.map((stat) => (
                        <div
                            key={stat.difficulty}
                            className="bg-slate-700/60 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 shadow-lg text-center transition-all hover:shadow-teal-500/30 hover:scale-105"
                        >
                            <h3 className="text-xl font-semibold capitalize text-teal-300">
                                {stat.difficulty}
                            </h3>
                            <p className="text-4xl font-bold text-slate-100 my-2">
                                {stat.count}
                            </p>
                            <p className="text-sm text-slate-400">Solved</p>
                            <p className="text-xs text-slate-500 mt-1">
                                ({stat.submissions} attempts)
                            </p>
                        </div>
                    ))}
                </div>
            </section>
            {/* Contest Performance */}
            {userContests?.userContestRanking && (
                <section className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-6 md:p-8">
                    <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2 border-purple-500/40 text-purple-300">
                        {" "}
                        {/* Different accent */}
                        Contest Performance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            label="Contest Rating"
                            value={userContests.userContestRanking.rating.toFixed(
                                0
                            )}
                            className="hover:shadow-purple-500/30"
                        />
                        <StatCard
                            label="Global Ranking"
                            value={userContests.userContestRanking.globalRanking.toLocaleString()}
                            className="hover:shadow-purple-500/30"
                        />
                        <StatCard
                            label="Attended Contests"
                            value={
                                userContests.userContestRanking
                                    .attendedContestsCount
                            }
                            className="hover:shadow-purple-500/30"
                        />
                        <StatCard
                            label="Top Percentage"
                            value={`${userContests.userContestRanking.topPercentage.toFixed(
                                2
                            )}%`}
                            className="hover:shadow-purple-500/30"
                        />
                        <StatCard
                            label="Total Participants (Last)"
                            value={userContests.userContestRanking.totalParticipants.toLocaleString()}
                            className="hover:shadow-purple-500/30"
                        />
                    </div>
                </section>
            )}
            {/* Recent Submissions */}
            <section className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2 border-pink-500/40 text-pink-300">
                    {" "}
                    {/* Different accent */}
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
                                    Problem
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                                >
                                    Status
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
                            {userSubmissions.slice(0, 10).map((sub, index) => (
                                <tr
                                    key={`${sub.titleSlug}-${sub.timestamp}-${index}`}
                                    className="hover:bg-slate-700/50 transition-colors duration-150"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">
                                        <a
                                            href={`https://leetcode.com${sub.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-pink-400 hover:text-pink-300 hover:underline"
                                        >
                                            {sub.title}
                                        </a>
                                    </td>
                                    <td
                                        className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                                            sub.statusDisplay === "Accepted"
                                                ? "text-green-400"
                                                : "text-red-400"
                                        }`}
                                    >
                                        {sub.statusDisplay}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        {sub.lang}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {formatDistanceToNow(
                                            new Date(
                                                parseInt(sub.timestamp) * 1000
                                            ),
                                            { addSuffix: true }
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
        </div>
    );
}
