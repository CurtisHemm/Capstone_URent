import supabase from "@/lib/supabase";

export default async function handler(req, res) { 
    console.log("Get Accepted Matches API Route reached")

    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { preferenceId, listingId } = req.query;

    if (!preferenceId && !listingId) {
        return res.status(400).json({ error: "Missing data" });
    }

    const userMatching = preferenceId ? "listing_id" : "preference_id";
    const userIdType = preferenceId ? "preference_id" : "listing_id";
    const idType = preferenceId || listingId;
    const tableType = preferenceId ? "listings_table" : "preferences_table";

    console.log(userMatching, userIdType, idType, tableType);

    try {
        const { data: matches, error: getMatchesError } = await supabase
            .from('match_table')
            .select(userMatching)
            .eq(userIdType, idType)
            .eq('match_status', 'accepted');

        if (getMatchesError) {
            console.log("Error fetching the listing data:", getMatchesError);
            return res.status(500).json({ error: getMatchesError.message });
        }

        if (!matches || matches.length === 0) {
            return res.status(200).json({ results: [] });
        }

        const matchingIds = matches.map(match => match[userMatching]); 

        const { data: results, error: fetchError } = await supabase
            .from(tableType)
            .select("*")
            .in(userMatching, matchingIds); 

        if (fetchError) {
            console.log("Error fetching listings data:", fetchError);
            return res.status(500).json({ error: fetchError.message });
        }

        return res.status(200).json({ results });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}