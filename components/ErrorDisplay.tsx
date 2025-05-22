// components/ErrorDisplay.tsx
interface ErrorDisplayProps {
    message: string;
    platform?: string;
    username?: string;
}

export default function ErrorDisplay({
    message,
    platform,
    username,
}: ErrorDisplayProps) {
    return (
        <div
            className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md shadow-lg"
            role="alert"
        >
            <strong className="font-bold">Oops! Something went wrong.</strong>
            <span className="block sm:inline ml-2">{message}</span>
            {platform && username && (
                <p className="text-sm mt-1">
                    Could not fetch data for{" "}
                    <span className="font-semibold">{username}</span> on{" "}
                    <span className="font-semibold">{platform}</span>.
                </p>
            )}
            <p className="text-sm mt-1">
                Please try again later or check the username.
            </p>
        </div>
    );
}
