// Import
import supabase from "@/lib/supabase";

// Function to calculate disatnce between 2 lats/longs using haversine Formula
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const radius = 6371;                                   // Radius of earth
    const dLat = (lat2 - lat1) * (Math.PI / 180);          
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radius * c;
};

// API For getting matches
export default async function handler(req, res) { 
    console.log("Get Matches API Route reached")

    // Check client
    if (!supabase) {
        return res.status(500).json({ error: "Supabase client is not initialized" });
    }

    // Check request method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Query Parameters
    const { preferenceId, listingId } = req.query;

    // Check parameters
    if(!preferenceId && !listingId) {
        return res.status(400).json({ error: "Must have either a listing or preference Id"});
    }

    try {

        // Query data changing depending on if the user is a listing or tenant
        const userIdType = preferenceId ? "preference_id" : "listing_id";
        const tableType = preferenceId ? "preferences_table" : "listings_table";
        const idType = preferenceId || listingId;

        // Find tenants or listings from respective tables
        const { data: userProfile, error: profileError} = await supabase
            .from(tableType)
            .select("*")
            .eq(userIdType, idType)
            .single();
        
        if (profileError || !userProfile){
            return res.status(404).json({ error: "Profile not found" });
        }

        // Store the lat and long of user
        const { latitude: userLat, longitude: userLong } = userProfile;

        // Check if thye have lat and long
        if (!userLat || !userLong) {
            return res.status(400).json({ error: "User location missing" });
        }

        // Query values for potenital matches
        const potentialMatchesTable = preferenceId ? "listings_table" : "preferences_table";
        const privateType = potentialMatchesTable === "listings_table" ? "is_private" : "is_pref_private";

        // Store logged in user id so you don't your own tenant profile or own listings
        const loggedUserId = userProfile.user_id;

        // Find potential matches that aren't private or their own
        const { data: profileMatches, error: profileMatchesFetchError} = await supabase
            .from(potentialMatchesTable)
            .select("*")
            .eq(privateType, false)
            .neq("user_id", loggedUserId);

        if (profileMatchesFetchError) {
            return res.status(500).json({ error: "Error fetching profiles for matching"});
        }

        // Calculate distance for each potential match
        const profilesWithDistance = (profileMatches || [])
            .filter(profile => profile.latitude && profile.longitude)
            .map(profile => ({
                ...profile,
                distance: haversineDistance(userLat, userLong, profile.latitude, profile.longitude)
        }));

        // Fetch all current matches from the match table
        const { data: matches, error: matchError } = await supabase
            .from("match_table")
            .select("preference_id, listing_id, match_status")
        
        if (matchError) {
            return res.status(500).json({ error: "Error fetching matches" });
        }

        // Array of all matches
        const allMatches = matches || [];

        // Set of matches that were already pending
        const pendingMatchIds = new Set();

        // Matches that were matched for first time
        const matchedIds = new Set();

        // Pending type based on if there user is a tenant or landlord
        const pendingType = preferenceId ? "pendingLandlord" : "pendingTenant"

        // Search through matches and see if they are already pending or not
        allMatches.forEach(match => {
            const profileId = preferenceId ? match.listing_id : match.preference_id;

            console.log(match.preference_id, preferenceId);
            if (match.match_status === pendingType && (match.preference_id == preferenceId || match.listing_id == listingId)) {
                pendingMatchIds.add(profileId);
            } else {
                matchedIds.add(profileId);
            }
        });

        // Array or pendings and unmatched matches
        let pendingProfiles = [];
        let unmatchedProfiles = [];

        // Pushing matching and unmatched matches
        profilesWithDistance.forEach(profile => {
            const profileId = preferenceId ? profile.listing_id : profile.preference_id;
            if (pendingMatchIds.has(profileId)) {
                pendingProfiles.push(profile);
            } else if (!matchedIds.has(profileId)) {
                unmatchedProfiles.push(profile);
            }
        });

        // Sort and rank profiles based on matching values and preferences
        const sortedProfiles = [...pendingProfiles, ...unmatchedProfiles].map(profile => {
            let compatibilityScore = 0;     // Compatibility Score
            // Add points based on Compatibility
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

            // Prioritize pending, then higher compatibility, then shorter distance
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