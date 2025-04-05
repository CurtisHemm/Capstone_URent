// Import
import supabase from '@/lib/supabase';

// API for deleting Image
export default async function handler(req, res) {
    console.log('API Route reached');

    // Check if client is initalized
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    // Checking if the api route is for delete
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Body parameters
    const { photoUrl, uploadType } = req.body;

    // Check if url is empty
    if (!photoUrl) {
        return res.status(400).json({ error: "Missing photo URL"});
    }

    // Check uploadtype is empty or is uploadtype is a listing or preference image
    if (!uploadType || !['listing', 'preference'].includes(uploadType)) {
        return res.status(400).json({ error: 'Invalid upload type' });
    }

    // Bucket path
    const bucket = uploadType === 'preference' ? 'profile_images' : 'listing_images';
    const fileName = photoUrl.split('/').pop();
    const filePath = `pictures/${fileName}`;

    try {
        // Delete image from bucket
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