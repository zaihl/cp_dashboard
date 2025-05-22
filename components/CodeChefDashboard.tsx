// app/components/dashboards/CodeChefDashboard.tsx
import type { CodeChefUserProfile } from "@/lib/types";
import { format } from "date-fns";
import Image from "next/image";

interface StatCardProps {
    // Re-defined or imported
    label: string;
    value: string | number | null | undefined;
    className?: string;
}

const StatCard = ({ label, value, className = "" }: StatCardProps) => (
    <div
        className={`bg-slate-700/60 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4 shadow-lg text-center transition-all hover:scale-105 hover:shadow-orange-500/30 ${className}`}
    >
        <h3 className="text-sm font-medium text-slate-400">{label}</h3>
        <p className="text-2xl font-semibold text-orange-300 mt-1">
            {value ?? "N/A"}
        </p>
    </div>
);

interface Props {
    data: CodeChefUserProfile;
    username: string;
}

export default function CodeChefDashboard({ data, username }: Props) {
    const {
        name,
        profile,
        currentRating,
        highestRating,
        countryFlag,
        countryName,
        globalRank,
        countryRank,
        stars,
        ratingData,
    } = data;

    const heatMapUrl = `https://codechef-api.vercel.app/heatmap/${encodeURIComponent(
        username
    )}`;

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row items-center text-center md:text-left space-y-4 md:space-y-0 md:space-x-6 p-4">
                <Image
                    src={profile}
                    alt={`${name}'s profile picture`}
                    width={128}
                    height={128}
                    className="rounded-full border-4 border-orange-500/70 shadow-xl"
                    priority
                />
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
                            CodeChef: {name}
                        </span>
                    </h1>
                    <p className="text-2xl font-semibold text-orange-300 mt-1">
                        {currentRating}{" "}
                        <span className="text-xl text-amber-400">
                            ({stars})
                        </span>
                    </p>
                    {countryName && countryFlag && (
                        <div className="flex items-center justify-center md:justify-start mt-2">
                            <Image
                                src={countryFlag}
                                alt={countryName}
                                width={30}
                                height={20}
                                className="rounded-sm shadow-md"
                            />
                            <span className="ml-2 text-slate-400 text-sm">
                                {countryName}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Stats */}
            <section className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2 border-orange-500/40 text-orange-300">
                    Profile Stats
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard label="Current Rating" value={currentRating} />
                    <StatCard label="Highest Rating" value={highestRating} />
                    <StatCard
                        label="Global Rank"
                        value={globalRank?.toLocaleString() ?? "N/A"}
                    />
                    <StatCard
                        label="Country Rank"
                        value={countryRank?.toLocaleString() ?? "N/A"}
                    />
                </div>
            </section>

            {/* Heatmap using iframe */}
            <section className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2 border-lime-500/40 text-lime-300">
                    Submission Heatmap
                </h2>
                {username ? (
                    <div
                        className="w-full max-w-3xl xl:max-w-4xl mx-auto rounded-lg border border-slate-600/80 overflow-hidden shadow-inner"
                        style={{ height: "180px" }} // Adjust height as needed for the heatmap
                    >
                        <iframe
                            src={heatMapUrl}
                            title={`${username}'s CodeChef Submission Heatmap`}
                            className="w-full h-full"
                            frameBorder="0"
                            scrolling="no"
                        />
                    </div>
                ) : (
                    <p className="text-center py-8 text-slate-400">
                        Username not available for heatmap.
                    </p>
                )}
            </section>

            {/* Contest Rating History */}
            <section className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2 border-red-500/40 text-red-300">
                    Contest History
                </h2>
                {ratingData && ratingData.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-700/80 max-h-[500px]">
                        {" "}
                        {/* Added max-h for scroll */}
                        <table className="min-w-full">
                            <thead className="bg-slate-700/80 backdrop-blur-sm sticky top-0">
                                {" "}
                                {/* Sticky header */}
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                                    >
                                        Contest
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                                    >
                                        Rating
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                                    >
                                        Rank
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                                    >
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/80">
                                {ratingData.slice(0, 20).map((contest) => (
                                    <tr
                                        key={contest.name + contest.end_date}
                                        className="hover:bg-slate-700/50 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">
                                            {contest.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400 font-semibold">
                                            {contest.rating}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                            {contest.rank}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                            {format(
                                                new Date(contest.end_date),
                                                "MMM d, yyyy"
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center py-8 text-slate-400">
                        No contest history available.
                    </p>
                )}
            </section>
        </div>
    );
}
