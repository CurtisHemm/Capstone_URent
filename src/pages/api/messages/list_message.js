// Import supabase client
import supabase from '@/lib/supabase';

// API for getting messages in messages tab;e
export default async function handler(req, res) {
    console.log('Send Message API reached');

    // Check if supabase client is initalized
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    // Check if correct method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Query parameters
    const { user_id, is_landlord, receiver_id } = req.query;

    // Make sure none are empty
    if (!user_id || is_landlord === undefined || !receiver_id) {
        return res.status(400).json({ error: "Invalid request: Missing data"});
    }
    
    const isLandlordBool = is_landlord === 'true';  // Check if it is a landlord
    const id = parseInt(user_id);                   // Parse the user id
    const receiverId = parseInt(receiver_id);       // Parse the receiver id

    try {
        // Create query
        let query = supabase
            .from('messages_table')
            .select('*');

        // Query will change based on if the sender is the tenant or landlord
        if (isLandlordBool) {
            query = query.or(
                `and(sender_landlord_id.eq.${id},receiver_renter_id.eq.${receiverId})`,
                `and(sender_renter_id.eq.${receiverId},receiver_landlord_id.eq.${id})`
            );
        } else {
            query = query.or(
                `and(sender_renter_id.eq.${id},receiver_landlord_id.eq.${receiverId})`,
                `and(sender_landlord_id.eq.${receiverId},receiver_renter_id.eq.${id})`
            );
        }

        // Add date to query
        const { data, error } = await query
            .order('created_at', { ascending: true });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(data || []);
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}