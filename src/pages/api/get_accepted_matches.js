// Import
import supabase from "@/lib/supabase";

// API that will fetch accepted matches
export default async function handler(req, res) { 
    console.log("Get Accepted Matches API Route reached")

    // Check client
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    // Check request method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Query parameters
    const { preferenceId, listingId } = req.query;

    // Check parameters
    if (!preferenceId && !listingId) {
        return res.status(400).json({ error: "Missing data" });
    }

    // Variables change depending on if the user fetching is a tenant or landlord
    const userMatching = preferenceId ? "listing_id" : "preference_id";
    const userIdType = preferenceId ? "preference_id" : "listing_id";
    const idType = preferenceId || listingId;
    const tableType = preferenceId ? "listings_table" : "preferences_table";

    try {
        // Find accepted matchs
        const { data: matches, error: getMatchesError } = await supabase
            .from('match_table')
            .select(userMatching)
            .eq(userIdType, idType)
            .eq('match_status', 'accepted');

        if (getMatchesError) {
            console.log("Error fetching the match data:", getMatchesError);
            return res.status(500).json({ error: getMatchesError.message });
        }

        if (!matches || matches.length === 0) {
            return res.status(200).json({ results: [] });
        }

        // Create array of matches and their id
        const matchingIds = matches.map(match => match[userMatching]); 

        // Find the listing or preference data of accepted data
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