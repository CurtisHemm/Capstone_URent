// Import
import supabase from '@/lib/supabase';

// API declining or accepting match. This was for when a user declines a match they already accepted. Forgot I made this one  
export default async function handler(req, res) {
    console.log("Decline Match API Reached!");

    // Check if client is initalized
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    // Checking if the api route is for put
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Body parameters
    const { listingId, preferenceId, matchType, matchNotes } = req.body;

    // Check if all is inputted
    if (!listingId || !preferenceId || !matchType) {
        return res.status(400).json({ error: "Missing details"});
    }

    // Check match status
    const matchStatus = matchType === 'accepted' ? 'accepted' : 'declined'; 

    try {
        // Update match status and match notes
        const { error: matchingError } = await supabase
            .from('match_table')
            .update({ 
                match_status: matchStatus,
                match_notes: matchNotes 
            })
            .eq('listing_id', listingId)
            .eq('preference_id', preferenceId);

            if (matchingError) {
                return res.status(500).json({ error: matchingError.message });
            }
    
            return res.status(200).json({ message: "Match Updated"})

    } catch {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Something went wrong' });
    }

}

