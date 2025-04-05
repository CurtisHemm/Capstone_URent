// Import
import supabase from '@/lib/supabase';

// API for editing listing
export default async function handler(req, res) {
    console.log("Edit User Listing API Reached!");

    // Check if client is initalized
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    // Check if request method is correct
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Body parameters
    const { listingId, data, photoUrl, latitude, longitude } = req.body;

    // Check if parameters are empty or null
    if (!listingId || !data) {
        return res.status(400).json({ error: "Missing details"});
    }
    
    try {
        // Find listing first
        const { data: listingData, listingError } = await supabase
            .from('listings_table')
            .select('listing_id')
            .eq('listing_id', listingId)
            .single();
    
        if (listingError || !listingData) {
            return res.status(400).json({ error: 'Listing not found'});
        }

        // Edit listing 
        const { error: updateError } = await supabase
            .from('listings_table')
            .update({ 
                photo_url: photoUrl,
                street_address: data.streetAddress,
                location: data.listingLocation,
                asking_price: data.askingPrice,
                bed_count: data.listingBedCount,
                bath_count: data.listingBathCount,
                amenities: data.listingAmenities,
                pets_allowed: data.listingPetsAllowed,
                smoking_allowed: data.listingSmokingAllowed,
                availability: data.availability || null,
                listing_bio: data.listingBio || null,
                is_private: data.listingPrivate,
                latitude: latitude,
                longitude: longitude   
            })
            .eq('listing_id', listingId);

        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }

        return res.status(200).json({ message: "Listing Updated"})

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }

}

