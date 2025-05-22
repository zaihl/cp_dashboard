// app/components/BackgroundBlooms.tsx
const BackgroundBlooms = () => {
    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
            {" "}
            {/* Ensure it's behind everything and doesn't intercept clicks */}
            <div className="bloom-1"></div>
            <div className="bloom-2"></div>
            <div className="bloom-3"></div>
        </div>
    );
};

export default BackgroundBlooms;
