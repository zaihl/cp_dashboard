// /app/api/leetcode/getUser/route.ts
import { fetchLeetcodeUser } from "../fetchUserData";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    if (!username) {
        return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }
    return fetchLeetcodeUser(username)
        .then((data) => NextResponse.json(data))
        .catch((error) => {
            console.error(error);
            return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
        });
}