// /app/api/codechef/fetchUserData.ts
import {
    codeChefUserSchema,
    type CodeChefUser,
} from '@/lib/schemas'; // Adjust path as needed

const CODECHEF_API_BASE_URL = 'https://codechef-api.vercel.app/';

export const fetchCodeChefUser = async (handle: string): Promise<CodeChefUser> => {
    const res = await fetch(`${CODECHEF_API_BASE_URL}${handle}`);

    if (!res.ok) {
        const errorText = await res.text();
        console.error("CodeChef API Error:", res.status, errorText);
        throw new Error(`Failed to fetch data from CodeChef API: ${res.status} ${errorText}`);
    }

    const raw = await res.json();
    const parsed = codeChefUserSchema.safeParse(raw);

    if (!parsed.success) {
        console.error("Zod Parsing Error (CodeChef User):", parsed.error.format());
        // Log the raw data for debugging if parsing fails
        // console.error("Raw data received from CodeChef:", raw);
        throw new Error('Invalid CodeChef API response structure');
    }

    if (!parsed.data.success) {
        // The API itself might indicate failure despite a 2xx HTTP status
        console.error("CodeChef API indicated failure:", parsed.data);
        throw new Error(`CodeChef API reported an issue: Status ${parsed.data.status}`);
    }

    return parsed.data;
};