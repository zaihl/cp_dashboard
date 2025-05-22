// app/page.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Platform } from "@/lib/types";
import {
    FaSearch,
    FaTrash,
    FaHistory,
    FaUserCircle,
    FaCode,
} from "react-icons/fa"; // Added FaListUl for Problems page

const MAX_HISTORY_ITEMS = 5;

interface SearchHistoryEntry {
    platform: Platform;
    username: string;
    timestamp: number;
}

const getPlatformVisuals = (platform: Platform) => {
    // ... (getPlatformVisuals function remains the same as before)
    switch (platform) {
        case "leetcode":
            return {
                icon: <FaCode className="text-yellow-400" />,
                color: "border-yellow-500/50",
                name: "LeetCode",
            };
        case "codeforces":
            return {
                icon: <FaCode className="text-blue-400" />,
                color: "border-blue-500/50",
                name: "Codeforces",
            };
        case "codechef":
            return {
                icon: <FaCode className="text-orange-400" />,
                color: "border-orange-500/50",
                name: "CodeChef",
            };
        case "atcoder":
            return {
                icon: <FaCode className="text-cyan-400" />,
                color: "border-cyan-500/50",
                name: "AtCoder",
            };
        default:
            return {
                icon: <FaUserCircle className="text-slate-400" />,
                color: "border-slate-600/50",
                name: "Platform",
            };
    }
};

export default function HomePage() {
    const [username, setUsername] = useState("");
    const [platform, setPlatform] = useState<Platform>("leetcode");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>(
        []
    );
    const router = useRouter();

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(
                "cpDashboardSearchHistory"
            );
            if (storedHistory) {
                setSearchHistory(JSON.parse(storedHistory));
            }
        } catch (e) {
            console.warn(
                "Could not access localStorage for search history:",
                e
            );
        }
    }, []);

    const saveSearchToHistory = (
        searchPlatform: Platform,
        searchUsername: string
    ) => {
        // ... (saveSearchToHistory function remains the same as before)
        if (!searchUsername.trim()) return;

        const newEntry: SearchHistoryEntry = {
            platform: searchPlatform,
            username: searchUsername.trim(),
            timestamp: Date.now(),
        };

        try {
            let updatedHistory = [newEntry, ...searchHistory];
            updatedHistory = updatedHistory.filter(
                (item, index, self) =>
                    index ===
                    self.findIndex(
                        (t) =>
                            t.platform === item.platform &&
                            t.username === item.username
                    )
            );
            if (updatedHistory.length > MAX_HISTORY_ITEMS) {
                updatedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);
            }
            localStorage.setItem(
                "cpDashboardSearchHistory",
                JSON.stringify(updatedHistory)
            );
            setSearchHistory(updatedHistory);
        } catch (e) {
            console.warn(
                "Could not save to localStorage for search history:",
                e
            );
        }
    };

    const handleClearHistory = () => {
        // ... (handleClearHistory function remains the same as before)
        try {
            localStorage.removeItem("cpDashboardSearchHistory");
            setSearchHistory([]);
        } catch (e) {
            console.warn("Could not clear localStorage for search history:", e);
        }
    };

    const handleHistoryItemClick = (entry: SearchHistoryEntry) => {
        // ... (handleHistoryItemClick function remains the same as before)
        setPlatform(entry.platform);
        setUsername(entry.username);
    };

    const handleSubmit = (e: FormEvent) => {
        // Removed p, u params for direct form submit
        e.preventDefault();
        if (!username.trim()) {
            setError("Username cannot be empty.");
            return;
        }
        setError(null);
        setIsLoading(true);
        saveSearchToHistory(platform, username);
        router.push(`/${platform}/${encodeURIComponent(username.trim())}`);
    };

    return (
        // Adjusted main container for better vertical centering and spacing if content grows
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] py-10 px-4">
            {" "}
            {/* Adjusted padding and min-height */}
            <div className="w-full max-w-md space-y-8">
                {" "}
                {/* Container for all homepage content */}
                {/* Search Card */}
                <div className="p-8 space-y-6 bg-slate-800/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
                    <h1 className="text-3xl font-bold text-center">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
                            CP Dashboard Search
                        </span>
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="off"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-4 py-2.5 bg-slate-700/80 backdrop-blur-sm border border-slate-600/70 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors"
                                placeholder="Enter username"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="platform"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Platform
                            </label>
                            <select
                                id="platform"
                                name="platform"
                                value={platform}
                                onChange={(e) =>
                                    setPlatform(e.target.value as Platform)
                                }
                                className="mt-1 block w-full pl-3 pr-10 py-2.5 bg-slate-700/80 backdrop-blur-sm border border-slate-600/70 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors"
                            >
                                <option value="leetcode">LeetCode</option>
                                <option value="codeforces">Codeforces</option>
                                <option value="codechef">CodeChef</option>
                                <option value="atcoder">AtCoder</option>
                            </select>
                        </div>

                        {error && (
                            <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md border border-red-700/50">
                                {error}
                            </p>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out transform active:scale-95"
                            >
                                <FaSearch />
                                {isLoading
                                    ? "Searching..."
                                    : "Search User Profile"}
                            </button>
                        </div>
                    </form>
                </div>
                {/* Search History Section */}
                {searchHistory.length > 0 && (
                    <div className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/40 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-slate-300 flex items-center gap-2">
                                <FaHistory className="text-sky-400" /> Recent
                                Searches
                            </h2>
                            <button
                                onClick={handleClearHistory}
                                className="text-xs text-slate-400 hover:text-red-400 hover:underline flex items-center gap-1 transition-colors"
                                title="Clear search history"
                            >
                                <FaTrash /> Clear
                            </button>
                        </div>
                        <ul className="space-y-2.5">
                            {searchHistory.map((item, index) => {
                                const platformVisuals = getPlatformVisuals(
                                    item.platform
                                );
                                return (
                                    <li
                                        key={`${item.platform}-${item.username}-${item.timestamp}-${index}`}
                                    >
                                        <button
                                            onClick={() =>
                                                handleHistoryItemClick(item)
                                            }
                                            className={`w-full flex items-center justify-between p-3 bg-slate-700/70 hover:bg-slate-600/90 backdrop-blur-sm border ${platformVisuals.color} rounded-lg shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500/70`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-lg">
                                                    {platformVisuals.icon}
                                                </span>
                                                <span className="text-sm font-medium text-slate-200">
                                                    {item.username}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-400 capitalize bg-slate-800/50 px-2 py-0.5 rounded-full">
                                                {platformVisuals.name}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}