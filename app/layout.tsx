// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import BackgroundBlooms from "@/components/BackgroundBlooms"; // Adjust path if needed
import Link from "next/link";

export const metadata: Metadata = {
    title: "Coding Dashboards",
    description: "Combined competitive coding dashboards",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen flex flex-col /* Styles now in globals.css or below */">
                <BackgroundBlooms /> {/* Add the blooms here */}
                <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/70 p-4 shadow-lg border-b border-slate-700/50">
                    <nav className="container mx-auto flex justify-between items-center">
                        <Link
                            href="/"
                            className="text-xl font-bold text-sky-400 hover:text-sky-300 transition-colors"
                        >
                            CP Dashboard
                        </Link>
                    </nav>
                </header>
                <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 relative z-10">
                    {children}
                </main>
                <footer className="text-center p-4 text-slate-500 text-sm border-t border-slate-800/50 relative z-10">
                    © {new Date().getFullYear()} Coding Dashboard Aggregator.
                    All rights reserved.
                </footer>
            </body>
        </html>
    );
}
