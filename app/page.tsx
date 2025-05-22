// app/page.tsx
"use client"; // This component needs interactivity (state, event handlers)

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Platform } from "@/lib/types"; // Assuming types.ts is in lib

export default function HomePage() {
    const [username, setUsername] = useState("");
    const [platform, setPlatform] = useState<Platform>("leetcode");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            setError("Username cannot be empty.");
            return;
        }
        setError(null);
        setIsLoading(true);
        router.push(`/${platform}/${encodeURIComponent(username.trim())}`);
        // setIsLoading(false) will happen on navigation or if an error occurs before navigation
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            {" "}
            {/* Adjust height based on header/footer */}
            <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-xl shadow-2xl">
                <h1 className="text-3xl font-bold text-center text-sky-400">
                    Search Coding Profile
                </h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-slate-300"
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
                            className="mt-1 block w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                            placeholder="Enter username"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="platform"
                            className="block text-sm font-medium text-slate-300"
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
                            className="mt-1 block w-full pl-3 pr-10 py-2.5 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        >
                            <option value="leetcode">LeetCode</option>
                            <option value="codeforces">Codeforces</option>
                            <option value="codechef">CodeChef</option>
                        </select>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 bg-red-900/30 p-2 rounded-md">
                            {error}
                        </p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Searching..." : "Search Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}