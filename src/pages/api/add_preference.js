// Import
import supabase from '@/lib/supabase';

// API for adding preference
export default async function handler(req, res) {
    console.log('API Route reached');

    // Check if client is initalized
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    // Checking if the api route is for post
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Body parameters
    const { data, userId, photoUrl, latitude, longitude } = req.body;

    // Make sure none are empty
    if (!data || !userId) {
        return res.status(400).json({ error: "Invalid request: Missing data or userId"});
    }

    // Get data from parameters. Made this when switching to hook forms and was having issues, not sure if I even need this
    const { 
        preferredName, 
        location, 
        maxBudget, 
        petsAllowed, 
        bedCount, 
        bathCount, 
        amenities, 
        smokingAllowed, 
        preferencePrivate, 
        profileBio 
    } = data;

    try {
        // Check for exisiting preference
        const { data: existingPreference, error: fetchError } = await supabase
            .from('preferences_table')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("Error checking existing preference:", fetchError);
            return res.status(500).json({ error: "Error checking existing preference" });
        }

        if (existingPreference) {
            return res.status(400).json({ error: "User already has a preference. Please update instead." });
        }

        // Add preference
        const { data: newPreference, error: prefError } = await supabase
            .from('preferences_table')
            .insert([
                {
                    user_id: userId, 
                    preferred_name: preferredName || null,
                    photo_url: photoUrl, 
                    location: location,
                    max_budget: maxBudget || null, 
                    pets_allowed: petsAllowed,
                    bed_count: bedCount || null,
                    bath_count: bathCount || null,
                    smoking_allowed: smokingAllowed,
                    is_pref_private: preferencePrivate,
                    amenities: amenities || null,
                    profile_bio: profileBio || null,
                    latitude: latitude,
                    longitude: longitude
                }
            ])
            .select();

        if (prefError) {
            console.error("Error inserting preference:", prefError);
            return res.status(500).json({ error: prefError.message });
        }

        return res.status(201).json({ message: "Preference saved successfully", newPreference});

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }

}