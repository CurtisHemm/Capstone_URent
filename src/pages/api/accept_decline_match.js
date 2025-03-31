import supabase from "@/lib/supabase";

export default async function handler(req, res) { 
    console.log("Accept Match API Route reached")

    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { preferenceId, listingId, enumType } = req.body;

    if(!preferenceId || !listingId || !enumType) {
        return res.status(400).json({ error: "Missing either a preferenceId, listingId, or enumType"});
    }

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