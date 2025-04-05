// Import
import supabase from '@/lib/supabase';

// API for adding a match to matches table
export default async function handler(req, res) {
    console.log('Request Match Route reached');

    // Check client
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    // Request method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Body parameters
    const { preferenceId, listingId, enumType } = req.body;

    // Check parameters
    if(!preferenceId || !listingId || !enumType) {
        return res.status(400).json({ error: "Missing either a preferenceId, listingId, or enumType"});
    }

    try {
        // Insert match into table
        const { data, error } = await supabase
            .from("match_table")
            .insert([
                {
                    preference_id: preferenceId,
                    listing_id: listingId,
                    match_status: enumType
                }
            ]);

        if (error) {
            console.log("Error adding match:", error);
            return res.status(500).json({ error: error.message });
        }

        console.log("Match added successfully:", data);

        return res.status(200).json({ message: "Added Successfully" });

    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json({ error: 'Something went wrong' });
    }

    
}
