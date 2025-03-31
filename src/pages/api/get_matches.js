import supabase from "@/lib/supabase";

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const radius = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radius * c;
};

export default async function handler(req, res) { 
    console.log("Get Matches API Route reached")

    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { preferenceId, listingId } = req.query;

    if(!preferenceId && !listingId) {
        return res.status(400).json({ error: "Must have either a listing or preference Id"});
    }

    try {
        const userIdType = preferenceId ? "preference_id" : "listing_id";
        const tableType = preferenceId ? "preferences_table" : "listings_table";
        const idType = preferenceId || listingId;

        const { data: userProfile, error: profileError} = await supabase
            .from(tableType)
            .select("*")
            .eq(userIdType, idType)
            .single();
        
        if (profileError || !userProfile){
            return res.status(404).json({ error: "Profile not found" });
        }

        const { latitude: userLat, longitude: userLong } = userProfile;
        if (!userLat || !userLong) {
            return res.status(400).json({ error: "User location missing" });
        }

        const potentialMatchesTable = preferenceId ? "listings_table" : "preferences_table";
        const privateType = potentialMatchesTable === "listings_table" ? "is_private" : "is_pref_private";

        const loggedUserId = userProfile.user_id;

        const { data: profileMatches, error: profileMatchesFetchError} = await supabase
            .from(potentialMatchesTable)
            .select("*")
            .eq(privateType, false)
            .neq("user_id", loggedUserId);

        if (profileMatchesFetchError) {
            return res.status(500).json({ error: "Error fetching profiles for matching"});
        }

        const profilesWithDistance = (profileMatches || [])
            .filter(profile => profile.latitude && profile.longitude)
            .map(profile => ({
                ...profile,
                distance: haversineDistance(userLat, userLong, profile.latitude, profile.longitude)
        }));

        const { data: matches, error: matchError } = await supabase
            .from("match_table")
            .select("preference_id, listing_id, match_status")
        
        if (matchError) {
            return res.status(500).json({ error: "Error fetching matches" });
        }

        const allMatches = matches || [];

        const pendingMatchIds = new Set();
        const matchedIds = new Set();

        const pendingType = preferenceId ? "pendingLandlord" : "pendingTenant"

        allMatches.forEach(match => {
            const profileId = preferenceId ? match.listing_id : match.preference_id;

            console.log(match.preference_id, preferenceId);
            if (match.match_status === pendingType && (match.preference_id == preferenceId || match.listing_id == listingId)) {
                pendingMatchIds.add(profileId);
            } else {
                matchedIds.add(profileId);
            }
        });

        let pendingProfiles = [];
        let unmatchedProfiles = [];

        profilesWithDistance.forEach(profile => {
            const profileId = preferenceId ? profile.listing_id : profile.preference_id;
            if (pendingMatchIds.has(profileId)) {
                pendingProfiles.push(profile);
            } else if (!matchedIds.has(profileId)) {
                unmatchedProfiles.push(profile);
            }
        });

        const sortedProfiles = [...pendingProfiles, ...unmatchedProfiles].map(profile => {
            let compatibilityScore = 0;
            if (userProfile.bed_count === profile.bed_count) compatibilityScore++;
            if (preferenceId && profile.asking_price <= userProfile.max_budget) compatibilityScore++;
            if (!preferenceId && profile.max_budget >= userProfile.asking_price) compatibilityScore++;
            if (userProfile.bath_count === profile.bath_count) compatibilityScore++;
            if (userProfile.pets_allowed === profile.pets_allowed) compatibilityScore++;
            if (userProfile.smoking_allowed === profile.smoking_allowed) compatibilityScore++;

            const profileId = profile.listing_id ?? profile.preference_id;
            const isPending = pendingMatchIds.has(profileId);

            return { ...profile, compatibilityScore, profileId, isPending };
        })
        .filter(profile => profile.compatibilityScore >= 2 || profile.isPending)
        .sort((a, b) => {

            console.log(`Sorting: A (${a.profileId}) Pending: ${a.isPending}, B (${b.profileId}) Pending: ${b.isPending}`);

            if (a.isPending && !b.isPending) return -1;
            if (!a.isPending && b.isPending) return 1;
                    
            if (b.compatibilityScore !== a.compatibilityScore) {
                return b.compatibilityScore - a.compatibilityScore;
            } 

            return a.distance - b.distance;
        });

        console.log("Total matches found:", sortedProfiles.length);

        return res.status(200).json(sortedProfiles);

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}