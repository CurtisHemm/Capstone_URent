import supabase from '@/lib/supabase';

export default function handler(req, res) {
    console.log('Realtime Messages API reached');

    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { user_id, is_landlord } = req.query;

    if (!user_id || is_landlord === undefined) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    const isLandlordBool = is_landlord === 'true';

    console.log('Setting up realtime connection for:', {
        user_id,
        is_landlord: isLandlordBool
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sender_type = isLandlordBool ? 'sender_landlord_id' : 'sender_renter_id';
    const receiver_type = isLandlordBool ? 'receiver_landlord_id' : 'receiver_renter_id';

    const channel = supabase
        .channel('filtered-messages')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages_table'
        }, (payload) => {
            const newMessage = payload.new;
                
            if (newMessage[sender_type] === user_id || newMessage[receiver_type] === user_id) {
                console.log('New message received:', newMessage);
                res.write(`data: ${JSON.stringify(newMessage)}`);
            }
        })
        .subscribe();

    req.on('close', () => {
        console.log('Client disconnected, removing channel');
        supabase.removeChannel(channel);
    });
}