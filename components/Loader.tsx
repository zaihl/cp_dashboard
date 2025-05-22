// components/Loader.tsx
export default function Loader({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center space-y-2 p-10">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-300">{text}</p>
        </div>
    );
}
