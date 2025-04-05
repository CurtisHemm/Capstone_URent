// Import
import supabase from '@/lib/supabase';

// API for getting every listing a user has
export default async function handler(req, res) { 
    console.log("Get Listing API Route reached")

    // Check client
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    // Check request method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Query parameter
    const { userId } = req.query;

    // Check parameter
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        // Get listings based off of user id
        const { data: listings, getListingsError } = await supabase
            .from('listings_table')
            .select('*')
            .eq('user_id', userId);

        if (getListingsError) {
            console.log("Error fetching the listing data:", getListingsError);
            return res.status(500).json({ error: getListingsError.message });
        }

        if (!listings) {
            return res.status(404).json({ error: "Could not find listing data" });
        }

        return res.status(200).json({ listings });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}