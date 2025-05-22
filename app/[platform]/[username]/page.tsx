// app/[platform]/[username]/page.tsx
import { notFound } from "next/navigation";
import { getLeetCodeUser, getCodeforcesUser, getCodeChefUser } from "@/lib/api";
import type {
    Platform,
    LeetCodeUserProfile,
    CodeforcesUserProfile,
    CodeChefUserProfile,
} from "@/lib/types";

import Loader from "@/components/Loader"; // Will be wrapped by Suspense
import ErrorDisplay from "@/components/ErrorDisplay";

// Specific Dashboard Components
import LeetCodeDashboard from "@/components/LeetCodeDashboard";
import CodeforcesDashboard from "@/components/CodeForcesDashboard";
import CodeChefDashboard from "@/components/CodeChefDashboard";

interface UserDashboardPageProps {
    params: {
        platform: Platform;
        username: string;
    };
}

export async function generateMetadata({ params }: UserDashboardPageProps) {
    const { platform, username } = params;
    const decodedUsername = decodeURIComponent(username);
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    return {
        title: `${decodedUsername}'s ${platformName} Profile`,
        description: `View ${decodedUsername}'s competitive programming profile on ${platformName}.`,
    };
}

export default async function UserDashboardPage({
    params,
}: UserDashboardPageProps) {
    const { platform, username } = params;
    const decodedUsername = decodeURIComponent(username);

    if (!["leetcode", "codeforces", "codechef"].includes(platform)) {
        notFound(); // Or redirect to a custom 404 page
    }

    let userData;
    let errorState: string | null = null;

    try {
        switch (platform) {
            case "leetcode":
                userData = await getLeetCodeUser(decodedUsername);
                return (
                    <LeetCodeDashboard
                        data={userData as LeetCodeUserProfile}
                        username={decodedUsername}
                    />
                );
            case "codeforces":
                userData = await getCodeforcesUser(decodedUsername);
                return (
                    <CodeforcesDashboard
                        data={userData as CodeforcesUserProfile}
                        username={decodedUsername}
                    />
                );
            case "codechef":
                userData = await getCodeChefUser(decodedUsername);
                if (!(userData as CodeChefUserProfile).success) {
                    // Handle CodeChef API specific error reporting
                    errorState = `CodeChef API Error: ${
                        (userData as CodeChefUserProfile).status ||
                        "Failed to fetch profile."
                    }`;
                    userData = null; // Ensure we don't try to render with bad data
                } else {
                    return (
                        <CodeChefDashboard
                            data={userData as CodeChefUserProfile}
                            username={decodedUsername}
                        />
                    );
                }
                break;
            default:
                notFound();
        }
    } catch (err) {
        console.error(
            `Failed to load user data for ${platform}/${decodedUsername}:`,
            err
        );
        errorState =
            err instanceof Error ? err.message : "An unknown error occurred.";
    }

    if (errorState) {
        return (
            <ErrorDisplay
                message={errorState}
                platform={platform}
                username={decodedUsername}
            />
        );
    }

    // Fallback if userData somehow isn't set but no error was caught (should not happen with current logic)
    if (!userData) {
        return (
            <ErrorDisplay
                message="User data could not be loaded."
                platform={platform}
                username={decodedUsername}
            />
        );
    }

    // This part should ideally not be reached if the switch cases return directly
    // or if an error is caught. It's a fallback.
    return <Loader text={`Setting up ${platform} dashboard...`} />;
}
