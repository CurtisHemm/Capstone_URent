// Import supabase client
import supabase from '@/lib/supabase';

// API for creating SSE for real time messages
export default function handler(req, res) {
    console.log('Realtime Messages API reached');
    
    // Check if supabase client is initalized
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    // Check if correct method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Query parameters
    const { user_id, is_landlord } = req.query;

    // Check if query parameters aren't empty
    if (!user_id || is_landlord === undefined) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    // Check if landlord
    const isLandlordBool = is_landlord === 'true';

    // Configure SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Sender and receiver based on if the user is a landlord or not
    const sender_type = isLandlordBool ? 'sender_landlord_id' : 'sender_renter_id';
    const receiver_type = isLandlordBool ? 'receiver_landlord_id' : 'receiver_renter_id';

    // Create real time supabase channel
    const channel = supabase
        .channel('filtered-messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages_table'}, (payload) => {   // Watch for these changes
            const newMessage = payload.new;
                
            // Filter messages based on if they are a sender or receiver
            if (newMessage[sender_type] === user_id || newMessage[receiver_type] === user_id) {
                console.log('New message received:', newMessage);
                res.write(`data: ${JSON.stringify(newMessage)}`);
            }
        })
        .subscribe();

    // Close channel
    req.on('close', () => {
        supabase.removeChannel(channel);
    });
}