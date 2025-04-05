// Import
import supabase from '@/lib/supabase';

// API for getting a user's preference data
export default async function handler(req, res) { 
    console.log("Get Preference API Route reached")

    // Check client
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    // Check request method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Query Parameter
    const { userId } = req.query;

    // Check parameter
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        // Get preference
        const { data: preference, getPrefError } = await supabase
            .from('preferences_table')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (getPrefError) {
            console.log("Error fetching the preference data:", getPrefError);
            return res.status(500).json({ error: getPrefError.message });
        }

        if (!preference) {
            return res.status(404).json({ error: "Could not find preference data" });
        }

        return res.status(200).json({ preference });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}