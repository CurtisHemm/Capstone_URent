import supabase from '@/lib/supabase';

export default async function handler(req, res) {

    console.log('API Route reached');

    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { photoUrl, uploadType } = req.body;

    console.log(uploadType);

    if (!photoUrl) {
        return res.status(400).json({ error: "Missing photo URL"});
    }

    if (!uploadType || !['listing', 'preference'].includes(uploadType)) {
        return res.status(400).json({ error: 'Invalid upload type' });
    }


    const bucket = uploadType === 'preference' ? 'profile_images' : 'listing_images';
    const fileName = photoUrl.split('/').pop();
    const filePath = `pictures/${fileName}`;

    try {
        const { delError } = await supabase
            .storage
            .from(bucket)
            .remove([filePath]);

        if (delError) {
            console.log("Error deleting the image:", delError);
            return res.status(500).json({ error: delError.message });
        }

        return res.status(200).json({ message: "Image deleted successfully" });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}