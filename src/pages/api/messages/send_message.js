// Imports
import supabase from '@/lib/supabase';

// API for adding new row in message table
export default async function handler(req, res) {
    console.log('Send Message API reached');

    // Check if supabase client is initalized
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    // Check if correct method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Body parameters
    const { sender_id, receiver_id, message, sender_is_landlord } = req.body;

    // Make sure none are empty
    if (!sender_id || !receiver_id || message === undefined || sender_is_landlord === undefined) {
        return res.status(400).json({ error: "Invalid request: Missing data"});
    }

    // message data changes depending on if they are a landlord or not
    const messageData = {
        [sender_is_landlord ? 'sender_landlord_id' : 'sender_renter_id']: sender_id,
        [sender_is_landlord ? 'receiver_renter_id' : 'receiver_landlord_id']: receiver_id,
        message,
        created_at: new Date().toISOString()
    };

    // Insert new message
    try {
        const { error } = await supabase
            .from('messages_table')
            .insert([messageData]);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
    
}