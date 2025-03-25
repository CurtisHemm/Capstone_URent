import supabase from '@/lib/supabase';

export default async function handler(req, res) {
    console.log("Decline Match API Reached!");

    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { listingId, preferenceId, matchType, matchNotes } = req.body;

    if (!listingId || !preferenceId || !matchType) {
        return res.status(400).json({ error: "Missing details"});
    }

    const matchStatus = matchType === 'accepted' ? 'accepted' : 'declined'; 

    try {

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

