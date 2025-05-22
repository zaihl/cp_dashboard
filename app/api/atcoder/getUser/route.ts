/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/atcoder/getUser/route.ts
import { fetchAtCoderUser } from "../fetchUserData"; // Adjust path
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username"); // AtCoder user handle

    if (!username) {
        return NextResponse.json({ error: "Username (handle) is required" }, { status: 400 });
    }

    try {
        const data = await fetchAtCoderUser(username);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`API route error for AtCoder user ${username}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch data from AtCoder";
        const statusCode = error.message.toLowerCase().includes("not found") || error.message.includes("404") ? 404 : 500;
        return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
}