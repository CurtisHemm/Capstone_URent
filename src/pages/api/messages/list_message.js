import supabase from '@/lib/supabase';

export default async function handler(req, res) {
    console.log('Send Message API reached');

    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { user_id, is_landlord, receiver_id } = req.query;

    if (!user_id || is_landlord === undefined || !receiver_id) {
        return res.status(400).json({ error: "Invalid request: Missing data"});
    }
    
    const isLandlordBool = is_landlord === 'true';
    const id = parseInt(user_id);
    const receiverId = parseInt(receiver_id);

    try {
        let query = supabase
            .from('messages_table')
            .select('*');

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