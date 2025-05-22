// app/[platform]/[username]/page.tsx
import { notFound } from "next/navigation";
import {
    getLeetCodeUser,
    getCodeforcesUser,
    getCodeChefUser,
    getAtCoderUser, // Make sure this is imported
} from "@/lib/api";
import type {
    Platform,
    LeetCodeUserProfile,
    CodeforcesUserProfile,
    CodeChefUserProfile,
    AtCoderUserProfile, // Make sure this is imported
} from "@/lib/types";

import Loader from "@/components/Loader";
import ErrorDisplay from "@/components/ErrorDisplay";

// Specific Dashboard Components (ensure paths are correct if you've moved them, e.g., to a 'dashboards' subfolder)
import LeetCodeDashboard from "@/components/LeetCodeDashboard"; // Assuming it's in dashboards/
import CodeforcesDashboard from "@/components/CodeForcesDashboard"; // Assuming it's in dashboards/
import CodeChefDashboard from "@/components/CodeChefDashboard"; // Assuming it's in dashboards/
import AtCoderDashboard from "@/components/AtCoderDashboard"; // Assuming it's in dashboards/
interface UserDashboardPageProps {
    params: Promise<{
        platform: Platform; // This type should now include "atcoder"
        username: string;
    }>;
}

export async function generateMetadata(props: UserDashboardPageProps) {
    const params = await props.params;
    const { platform, username } = params;
    const decodedUsername = decodeURIComponent(username);
    // Ensure platform name capitalization is consistent even with new platforms
    const platformName =
        platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
    return {
        title: `${decodedUsername}'s ${platformName} Profile`,
        description: `View ${decodedUsername}'s competitive programming profile on ${platformName}.`,
    };
}

export default async function UserDashboardPage(props: UserDashboardPageProps) {
    const params = await props.params;
    const { platform, username } = params;
    const decodedUsername = decodeURIComponent(username);

    // Updated platform validation to include "atcoder"
    if (!["leetcode", "codeforces", "codechef", "atcoder"].includes(platform)) {
        notFound();
    }

    let userData; // This can be of type UserProfile for better type safety before casting
    let errorState: string | null = null;

    try {
        switch (platform) {
            case "leetcode":
                userData = await getLeetCodeUser(decodedUsername);
                return (
                    <LeetCodeDashboard
                        data={userData as LeetCodeUserProfile} // Cast is okay here as we know the type from the case
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
                // Specific check for CodeChef's own success flag
                if (!(userData as CodeChefUserProfile).success) {
                    errorState = `CodeChef API Error: ${
                        (userData as CodeChefUserProfile).status ||
                        "User not found or failed to fetch profile."
                    }`;
                    // Do not return here yet, let the generic error handling below catch it
                    // Set userData to null or undefined to ensure it falls through to error display if not successful
                    userData = undefined; // Or null, to trigger error display
                } else {
                    return (
                        <CodeChefDashboard
                            data={userData as CodeChefUserProfile}
                            username={decodedUsername}
                        />
                    );
                }
                // If CodeChef API reports failure, we want to fall through to the error display.
                // If we set userData to undefined/null and errorState is set, the logic below handles it.
                if (errorState) break; // Exit switch if errorState was set for CodeChef
                break; // This break was missing, important for CodeChef case if it's successful
            case "atcoder": // Added AtCoder case
                userData = await getAtCoderUser(decodedUsername);
                return (
                    <AtCoderDashboard
                        data={userData as AtCoderUserProfile}
                        username={decodedUsername}
                    />
                );
            default:
                // This case should ideally not be reached due to the initial validation
                // but as a safeguard for exhaustive switch:
                console.warn(`Unhandled platform: ${platform}`);
                notFound();
                return null; // Or an error component, notFound() should handle it
        }
    } catch (err) {
        console.error(
            `Failed to load user data for ${platform}/${decodedUsername}:`,
            err
        );
        errorState =
            err instanceof Error ? err.message : "An unknown error occurred.";
        // Ensure userData is not set if an error occurred during fetch
        userData = undefined;
    }

    // Centralized error display
    if (errorState || !userData) {
        // If errorState is set, or if userData is still undefined (e.g. CodeChef API failure)
        return (
            <ErrorDisplay
                message={
                    errorState ||
                    "User data could not be loaded or user not found."
                } // Provide a default message if errorState is null but userData is missing
                platform={platform}
                username={decodedUsername}
            />
        );
    }

    // This fallback Loader should ideally not be reached if the logic above is complete
    // (i.e., every successful case returns a dashboard, and every error/no-data case returns ErrorDisplay).
    // It's here as a last resort.
    console.warn(
        `Reached fallback loader for ${platform}/${decodedUsername}. This might indicate a logic gap.`
    );
    return <Loader text={`Finalizing ${platform} dashboard...`} />;
}
