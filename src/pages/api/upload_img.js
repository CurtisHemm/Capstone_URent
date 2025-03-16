import { IncomingForm } from 'formidable';
import fs from 'fs';
import supabase from '@/lib/supabase';

export const config = {
    api: {
      bodyParser: false,
    },
  };

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    } 

    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Formidable Error:', err);
            return res.status(500).json({ error: 'Error parsing form data' });
        }

        const file = files.file && files.file[0];

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const fileBuffer = fs.readFileSync(file.filepath);

            const fileExt = file.originalFilename.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `pictures/${fileName}`;
    
            const { data, error } = await supabase.storage
                .from('listing_images')
                .upload(filePath, fileBuffer, 
                { contentType: file.mimetype || 'image/jpeg' });
    
            if (error) throw error;
    
            const { data: publicUrlData } = supabase.storage
                .from('listing_images')
                .getPublicUrl(filePath);
    
            res.status(200).json({ publicUrl: publicUrlData.publicUrl });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Failed to upload image' });
        }
    });
   
}