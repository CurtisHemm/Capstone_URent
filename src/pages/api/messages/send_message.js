import supabase from '@/lib/supabase';

export default async function handler(req, res) {
    console.log('Send Message API reached');

    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { sender_id, receiver_id, message, sender_is_landlord } = req.body;

    console.log(sender_id, receiver_id, message, sender_is_landlord);

    if (!sender_id || !receiver_id || message === undefined || sender_is_landlord === undefined) {
        return res.status(400).json({ error: "Invalid request: Missing data"});
    }

    const messageData = {
        [sender_is_landlord ? 'sender_landlord_id' : 'sender_renter_id']: sender_id,
        [sender_is_landlord ? 'receiver_renter_id' : 'receiver_landlord_id']: receiver_id,
        message,
        created_at: new Date().toISOString()
    };

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