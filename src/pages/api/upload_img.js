// Imports
import { IncomingForm } from 'formidable';
import fs from 'fs';
import supabase from '@/lib/supabase';

// Disable built-in body parser to allow `formidable` to handle multipart/form-data
export const config = {
    api: {
      bodyParser: false,
    },
  };

// API for uploading an image to supabase bucket, and to user's profile
export default async function handler(req, res) {
    
    // Request method 
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    } 

    // Create form
    const form = new IncomingForm();

    // Parsing form
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Formidable Error:', err);
            return res.status(500).json({ error: 'Error parsing form data' });
        }

        // Get uploaded file and file type
        const file = files.file && files.file[0];
        const uploadType = fields.uploadType?.[0];

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!uploadType || !['listing', 'preference'].includes(uploadType)) {
            return res.status(400).json({ error: 'Invalid upload type' });
        }

        try {
            // Give temp path
            const fileBuffer = fs.readFileSync(file.filepath);
            
            // Extract file and create unique name
            const fileExt = file.originalFilename.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;

            // Bucket path
            const bucket = uploadType === 'preference' ? 'profile_images' : 'listing_images';
            const filePath = `pictures/${fileName}`;
    
            // Upload image to bucket
            const { error } = await supabase.storage
                .from(bucket)
                .upload(filePath, fileBuffer, 
                { contentType: file.mimetype || 'image/jpeg' });
    
            if (error) throw error;
    
            // Get bucket url of that image
            const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);
    
            res.status(200).json({ publicUrl: publicUrlData.publicUrl });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Failed to upload image' });
        }
    });
   
}