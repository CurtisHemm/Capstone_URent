// Import
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMatchUpdater } from '@/hooks/useMatchUpdate.js';
import Link from 'next/link';   

// Page for showing matches a listing has
const LandlordAcceptedMatches = () => {
    const [tenants, setTenants] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const { listing_id } = router.query;
    const { updateMatch } = useMatchUpdater();

    // Fetch user session, if there isn't one, redirect to login page
    useEffect(() => {
        const fetchUserSession = async () => {
            const response = await fetch('/api/session', { credentials: 'include' });
            const data = await response.json();
            if (data.user) {
                setUser(data.user);
                if (listing_id) {  
                    fetchUserListingsMatches(listing_id);
                }
            } else {
                router.push('/login');
            }
        };
        fetchUserSession();
    }, [router, listing_id]);

    // Fetch tenants with accepted matches
    const fetchUserListingsMatches = async (listingId) => {
        
        try {
            const tenantMatchesResponse = await fetch(`/api/get_accepted_matches?listingId=${listingId}`);
            const tenantMatchesResult = await tenantMatchesResponse.json();

            if (tenantMatchesResponse.ok) {
                setTenants(tenantMatchesResult.results || []);
                setLoading(false);
            } else {
                setErrorMessage(tenantMatchesResult.error || "Failed to fetch tenant matches.");
            }

        } catch (matchesError) {
            console.error("Error fetching matches:", matchesError);
        } 
  
    };

    // When a landlord declines a tenant, update them in the matches table
    const handleDecline= async (preferenceId) => { 
        if (!window.confirm("Are you sure you want to decline this tenant?")) { return; }
        updateMatch({
            listing_id,
            preferenceId,
            matchType: "declined",
            matchNotes: "Landlord declined matched Tenant",
            onSuccess: () => setTenants(tenants.filter(preference => preference.preference_id !== preferenceId)),
            setErrorMessage
        });
        
    };

    
    if (loading) return <p>Loading...</p>;

    return (
        <div className="container">
        <h2>Your Listing's Matches</h2>

        {errorMessage && <div className="errorMessage">{errorMessage}</div>}

        {tenants.length === 0 ? (
            <div className="signUpLink">
                <Link href="/all_listings">You have no Matches. Go back to listings</Link>
            </div>
        ) : (
            <ul className="listings">
                {tenants.map((tenant) => (
                    <li key={tenant.preference_id} className="listing-item">
                        <img src={tenant.photo_url} alt="TenantImg" className="listing-img" />
                        <div>
                            <h3>{tenant.preferred_name}</h3>
                            <p><strong>Preferred Location:</strong> ${tenant.location}</p>
                            <p><strong>Their Max Budget:</strong> ${tenant.max_budget}</p>
                            <p><strong>Beds:</strong> {tenant.bed_count} | <strong>Baths:</strong> {tenant.bath_count}</p>
                            <p><strong>Amenities:</strong> {tenant.amenities}</p>
                            <p><strong>Pets Allowed:</strong> {tenant.pets_allowed ? "Yes" : "No"}</p>
                            <p><strong>Smoking Allowed:</strong> {tenant.smoking_allowed ? "Yes" : "No"}</p>
                            <p><strong>Tenant Bio:</strong> {tenant.profile_bio}</p>

                            <div className='button-divider'>
                                <button onClick={() => router.push(`/chat_messages/${listing_id}?receiver=${tenant.preference_id}&is_landlord=true`)} className='listing-button'>Message The Tenant</button>
                                <button onClick={() => handleDecline(tenant.preference_id)} className='listing-button'>Remove From Matches</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        )}
    </div>
    )
}

export default LandlordAcceptedMatches;