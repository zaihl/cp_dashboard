/* eslint-disable @typescript-eslint/no-explicit-any */
// /app/api/codechef/getUser/route.ts
import { fetchCodeChefUser } from "../fetchUserData"; // Adjust path based on your structure
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Ensures the route is re-evaluated on each request

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username"); // Or "handle" if you prefer that query param name

    if (!username) {
        return NextResponse.json({ error: "Username (handle) is required" }, { status: 400 });
    }

    try {
        const data = await fetchCodeChefUser(username);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`API route error for CodeChef user ${username}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch data from CodeChef";
        // Determine appropriate status code based on error type if possible
        const statusCode = error.message.includes("User not found") || error.message.includes("404") ? 404 : 500;
        return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
}