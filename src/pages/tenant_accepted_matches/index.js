import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMatchUpdater } from '@/hooks/useMatchUpdate.js';
import Link from 'next/link';   

const TenantAcceptedMatches = () => {
    const [listings, setListings] = useState([]);
    const [user, setUser] = useState(null);
    const [preferenceId, setPreferenceId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const { updateMatch } = useMatchUpdater();

    useEffect(() => {
        const fetchUserSession = async () => {
            const response = await fetch('/api/session', { credentials: 'include' });
            const data = await response.json();
            if (data.user) {
                setUser(data.user);
                fetchUserPreferencesMatches(data.user.user_id);
            } else {
                router.push('/login');
            }
        };
        fetchUserSession();
    }, [router]);

    const fetchUserPreferencesMatches = async (userId) => {
        try {
            const response = await fetch(`/api/get_preference?userId=${userId}`);
            const result = await response.json();

            if (!response.ok) {
                console.error("Response not OK:", response.status, result);
                return;
            }

            if (!result.preference) {
                console.warn("No preference found in result");
                return;
            }

            const pref = result.preference;
            setPreferenceId(pref.preference_id);

            try {
                const listingMatchesResponse = await fetch(`/api/get_accepted_matches?preferenceId=${pref.preference_id}`);
                const listingMatchesResult = await listingMatchesResponse.json();

                if (listingMatchesResponse.ok) {
                    setListings(listingMatchesResult.results || []);
                    setLoading(false);
                } else {
                    setErrorMessage(listingMatchesResult.error || "Failed to fetch listing matches.");
                }

            } catch (matchesError) {
                console.error("Error fetching matches:", matchesError);
            }

        } catch (error) {
            console.error("Error fetching preferences:", error);
        }
    };

    const handleDecline= async (listing_id) => { 
        if (!window.confirm("Are you sure you want to decline this listing?")) { return; }
        updateMatch({
            listing_id,
            preferenceId,
            matchType: "declined",
            matchNotes: "Tenant declined matched listing",
            onSuccess: () => setListings(listings.filter(listing => listing.listing_id !== listing_id)),
            setErrorMessage
        });
        
    };
    
    if (loading) return <p>Loading...</p>;

    return (
        <div className="container">
        <h2>{user.first_name} Listings</h2>

        {errorMessage && <div className="errorMessage">{errorMessage}</div>}

        {listings.length === 0 ? (
            <div className="signUpLink">
                <Link href="/tenant_matches">You have no matches. Find some here.</Link>
            </div>
        ) : (
            <ul className="listings">
                {listings.map((listing) => (
                    <li key={listing.listing_id} className="listing-item">
                        <img src={listing.photo_url} alt="ListingImg" className="listing-img" />
                        <div>
                            <h3>{listing.street_address}, {listing.location}</h3>
                            <p><strong>Price:</strong> ${listing.asking_price}</p>
                            <p><strong>Beds:</strong> {listing.bed_count} | <strong>Baths:</strong> {listing.bath_count}</p>
                            <p><strong>Amenities:</strong> {listing.amenities}</p>
                            <p><strong>Pets Allowed:</strong> {listing.pets_allowed ? "Yes" : "No"}</p>
                            <p><strong>Smoking Allowed:</strong> {listing.smoking_allowed ? "Yes" : "No"}</p>
                            <p><strong>Availability:</strong> {listing.availability ? listing.availability : "Not specified"}</p>
                            <p><strong>Listing Bio:</strong> {listing.listing_bio}</p>
                            <p><strong>Private Listing:</strong> {listing.is_private ? "Yes" : "No"}</p>

                            <div className='button-divider'>
                                <button className='listing-button'>Message The Landlord</button>
                                <button onClick={() => handleDecline(listing.listing_id)} className='listing-button'>Remove From Matches</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        )}
    </div>
    )
}

export default TenantAcceptedMatches;