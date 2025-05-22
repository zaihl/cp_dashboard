/* eslint-disable @typescript-eslint/no-explicit-any */
// /app/api/codeforces/getUser/route.ts
import { fetchCodeforcesUser } from "../fetchUserData"; // Adjust path based on your structure
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Ensures the route is re-evaluated on each request

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username"); // Or "handle" if you prefer

    if (!username) {
        return NextResponse.json({ error: "Username (handle) is required" }, { status: 400 });
    }

    try {
        const data = await fetchCodeforcesUser(username);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`API route error for Codeforces user ${username}:`, error);
        // Provide a more specific error message if possible
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch data from Codeforces";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}