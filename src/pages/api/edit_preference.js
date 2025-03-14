import supabase from '@/lib/supabase';

export default async function handler(req, res) {
    console.log("Edit User Password API Reached!");

    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }


    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { data, preferenceId} = req.body;

    if (!preferenceId || !data) {
        return res.status(400).json({ error: "Missing details"});
    }
    
    try {
        const { data: prefData, prefError } = await supabase
            .from('preferences_table')
            .select('preference_id')
            .eq('preference_id', preferenceId)
            .single();
    
        if (prefError || !prefData) {
            return res.status(400).json({ error: 'Preference not found'});
        }

        const { error: updateError } = await supabase
            .from('preferences_table')
            .update({ 
                preferred_name: data.preferredName || null,
                // photo_url: photoUrl || null, 
                location: data.location,
                max_budget: data.maxBudget || null, 
                pets_allowed: data.petsAllowed,
                bed_count: data.bedCount || null,
                bath_count: data.bathCount || null,
                smoking_allowed: data.smokingAllowed,
                is_pref_private: data.preferencePrivate,
                amenities: data.amenities || null,
                profile_bio: data.profileBio || null, 
            })
            .eq('preference_id', preferenceId);

        if (updateError) {
            return res.status(500).json({ error: "Failed to update preference"});
        }

        return res.status(200).json({ message: "Preference Updated"})

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }

}

