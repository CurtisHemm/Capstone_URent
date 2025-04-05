//Import
import supabase from '@/lib/supabase';

// API for deleting listing
export default async function handler(req, res) {
    console.log('API Route reached');

    // Check if client is initalized
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    // Checking if the api route is for delete
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Body parameter
    const { listingId } = req.body;

    // Check if parameter isn't empty
    if (!listingId) {
        return res.status(400).json({ error: "Listing Id is required"});
    }

    try {
        // Delete listing
        const { delError } = await supabase
            .from('listings_table')
            .delete()
            .eq('listing_id', listingId);

        if (delError) {
            console.log("Error deleting the listing data:", delError);
            return res.status(500).json({ error: delError.message });
        }

        return res.status(200).json({ message: "Listing deleted successfully" });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}