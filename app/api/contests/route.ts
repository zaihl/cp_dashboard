/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/contests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UnifiedContest } from '@/lib/types'; // Adjust path
import { parseISO } from 'date-fns'; // For robust date parsing

const CLIST_API_BASE_URL = 'https://clist.by/api/v4/contest/';

const CLIST_USERNAME = process.env.CLIST_USERNAME;
const CLIST_API_KEY = process.env.CLIST_API_KEY;

// Mapping of CLIST host names to your desired display names
const platformDisplayMap: { [key: string]: string } = {
    "leetcode.com": "LeetCode",
    "codeforces.com": "Codeforces",
    "atcoder.jp": "AtCoder",
    "codechef.com": "CodeChef",
    "topcoder.com": "TopCoder",
    "hackerearth.com": "HackerEarth",
    "codingcompetitions.withgoogle.com": "Google", // Kick Start, Code Jam etc.
    // Add more as needed based on item.host from CLIST.by
};

// Mapping from your frontend platform filter values to CLIST.by resource IDs (numeric)
// You need to find these IDs from CLIST.by documentation or by inspecting their resource list.
// These are EXAMPLES and might not be accurate or up-to-date.
const platformResourceIds: { [key: string]: string } = {
    "leetcode.com": "102",
    "codeforces.com": "1",
    "codechef.com": "2",
    // "atcoder.jp": "93",
    // "topcoder.com": "12",
};


export async function GET(request: NextRequest) {
    if (!CLIST_USERNAME || !CLIST_API_KEY) {
        console.error("CLIST API credentials missing from environment variables.");
        return NextResponse.json({ error: "CLIST API credentials not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get('filter') || 'upcoming'; // 'upcoming', 'past', 'all'
    const limit = searchParams.get('limit') || '25';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const resourcesQuery = searchParams.get('resources'); // Comma-separated hostnames e.g., "leetcode.com,codeforces.com"

    const offset = (page - 1) * parseInt(limit, 10);

    const clistParams = new URLSearchParams({
        username: CLIST_USERNAME,
        api_key: CLIST_API_KEY,
        limit: limit,
        offset: offset.toString(),
    });

    const now = new Date();
    const nowISO = now.toISOString();

    if (filterType === 'upcoming') {
        clistParams.set('start__gt', nowISO); // Contests starting after now
        clistParams.set('order_by', 'start');   // Oldest upcoming first
    } else if (filterType === 'past') {
        clistParams.set('end__lt', nowISO);     // Contests ended before now
        clistParams.set('order_by', '-start');  // Newest past first
    } else { // 'all' or any other case
        // For 'all', you might fetch a wider range, e.g., past month and future year
        // Or let CLIST default (which might be upcoming)
        // To be safe, if 'all', don't add time constraints or add very wide ones.
        // CLIST by default might show upcoming if no time constraint.
        // If you want truly all, you might need to make multiple calls or adjust parameters.
        // For now, let's default 'all' to a broad range of upcoming contests
        clistParams.set('order_by', 'start');
    }

    if (resourcesQuery) {
        const requestedHosts = resourcesQuery.split(',');
        const resourceIdParams = requestedHosts
            .map(host => platformResourceIds[host])
            .filter(Boolean) // Remove any undefined/null if a host isn't in our map
            .join(',');

        if (resourceIdParams) {
            clistParams.set('resource_id__in', resourceIdParams);
        }
    }

    const finalUrl = `${CLIST_API_BASE_URL}?${clistParams.toString()}`;

    try {
        const response = await fetch(finalUrl, {
            next: {
                revalidate: 300 // Cache the response for 300 seconds (5 minutes)
                // You can also use tags for on-demand revalidation if needed:
                // tags: ['contests', `contests-${filterType}`],
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API /contests] CLIST API Error: ${response.status}`, errorText);
            return NextResponse.json({ error: `Failed to fetch contests from CLIST.by. Status: ${response.status}.` }, { status: response.status });
        }

        const data = await response.json();

        const contests: UnifiedContest[] = (data.objects || []).map((item: any) => {
            const platformName = platformDisplayMap[item.host.toLowerCase()] || item.host; // Normalize host for map lookup
            let startTime, endTime;
            try {
                startTime = parseISO(item.start);
                endTime = parseISO(item.end);
            } catch (e: any) {
                console.warn(`Could not parse date for contest ${item.id}: ${item.start} / ${item.end} / ${e.message}`);
                // Skip this contest or handle with invalid dates
                return null;
            }

            return {
                id: item.id,
                event: item.event,
                href: item.href,
                resource: item.resource?.name || item.host, // CLIST v4 resource is an object
                host: item.host,
                start: item.start, // Keep original ISO string for consistency
                end: item.end,     // Keep original ISO string
                duration: item.duration, // Duration in seconds
                isUpcoming: startTime > now,
                isPast: endTime < now,
                platformDisplayName: platformName,
            };
        }).filter(Boolean) as UnifiedContest[]; // Filter out any nulls from parsing errors

        return NextResponse.json({
            contests: contests,
            meta: data.meta // Pass along pagination meta from CLIST
        });

    } catch (error: any) {
        console.error("[API /contests] Error fetching from CLIST.by (catch block):", error);
        return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
    }
}