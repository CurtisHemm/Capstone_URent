// Import
import supabase from "@/lib/supabase";

// API for accept or decling match request
export default async function handler(req, res) { 
    console.log("Accept Match API Route reached")

    // Check if supabase client is initalized
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    // Check if correct method
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Body Parameters
    const { preferenceId, listingId, enumType } = req.body;

    // Check that none are empty
    if(!preferenceId || !listingId || !enumType) {
        return res.status(400).json({ error: "Missing either a preferenceId, listingId, or enumType"});
    }

    // Edit request to either declined or accepted
    try {
        const { data, error } = await supabase
            .from("match_table")
            .update({ match_status: enumType })
            .eq("preference_id", preferenceId)
            .eq("listing_id", listingId);

        if (error) {
            console.log("Error updating match status:", error);
            return res.status(500).json({ error: error.message });
        }

        console.log("Match status updated successfully:", data);

        return res.status(200).json({ message: "Match status updated successfully" });

    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
    
}