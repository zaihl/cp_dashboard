// app/components/skeletons/SkeletonElement.tsx
interface SkeletonElementProps {
    type: "text" | "title" | "avatar" | "block" | "card-title" | "button";
    className?: string;
    lines?: number; // For multi-line text skeletons
}

export default function SkeletonElement({
    type,
    className = "",
    lines = 1,
}: SkeletonElementProps) {
    const basePulseClass = "bg-slate-700 animate-pulse rounded-md";

    if (type === "avatar") {
        return (
            <div
                className={`${basePulseClass} rounded-full ${className}`}
            ></div>
        );
    }

    if (type === "text" || type === "card-title" || type === "button") {
        const heights = {
            text: "h-4",
            "card-title": "h-5",
            button: "h-10 py-2.5 px-4",
        };
        const widths = {
            // Default widths, can be overridden by className
            text: "w-3/4",
            "card-title": "w-1/2",
            button: "w-24",
        };

        if (lines > 1) {
            return (
                <div className={`space-y-2 ${className}`}>
                    {Array.from({ length: lines }).map((_, i) => (
                        <div
                            key={i}
                            className={`${basePulseClass} ${heights[type]} ${
                                i === lines - 1 && lines > 1
                                    ? "w-5/6"
                                    : widths[type]
                            }`}
                        ></div>
                    ))}
                </div>
            );
        }
        return (
            <div
                className={`${basePulseClass} ${heights[type]} ${widths[type]} ${className}`}
            ></div>
        );
    }

    if (type === "title") {
        return (
            <div
                className={`${basePulseClass} h-8 md:h-10 w-1/2 md:w-1/3 ${className}`}
            ></div>
        );
    }

    // Default to 'block' for generic blocks or cards
    return <div className={`${basePulseClass} ${className}`}></div>;
}
