// Imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';   

const AllListings = () => {
    const [listings, setListings] = useState([]);    // Store array of listings
    const [user, setUser] = useState(null);             // Store user data
    const [loading, setLoading] = useState(true);       // Store loading state
    const [errorMessage, setErrorMessage] = useState(''); // Store error message
    const router = useRouter();                             // Next.js router instance

    // useEffect for checking if user session is active, and fetching the listings the user owns
    useEffect(() => {
        const fetchUserSession = async () => {
            const response = await fetch('/api/session', { credentials: 'include' });
            const data = await response.json();
            if (data.user) {
                setUser(data.user);
                fetchListings(data.user.user_id);
            } else {
                router.push('/login');
            }
        };
        fetchUserSession();
    }, [router]);

    // fetchListings function that calls get listing api with userId, and gets array of listings
    const fetchListings = async (userId) => {
        try {
            const response = await fetch(`/api/get_listing?userId=${userId}`);
            const result = await response.json();
            if (response.ok) {
                setListings(result.listings || []);
            } else {
                setErrorMessage(result.error || "Failed to fetch listings.");
            }
        } catch (error) {
            setErrorMessage("Error fetching listings.");
        }
        setLoading(false);
    };

    // handleDelete function for when user deletes a listing for the array. Calls delete listing api to delete listing from listings table
    const handleDelete = async (listingId) => { 
        if (!window.confirm("Are you sure you want to delete this listing?")) { return; }

        try {
            const response = await fetch('/api/delete_listing', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ listingId })
            });

            const result = await response.json();
            if (response.ok) {
                setListings(listings.filter(listing => listing.listing_id !== listingId));
            } else {
                setErrorMessage(result.error || "Could not delete listing.");
            }
        } catch (error) {
            setErrorMessage("Error deleting listing.");
        }

    }

    // Check if still loading
    if (loading) return <p>Loading...</p>;

    return (
        <div className="container">
        <h2>{user.first_name} Listings</h2>

        {/* Error Message */}
        {errorMessage && <div className="errorMessage">{errorMessage}</div>}

        {/* If user owns no listings, show an emtpy container with link to make listings
            If they own one or more, they can see the details, delete, view matches, or start match if its not private
        */}
        {listings.length === 0 ? (
            <div className="signUpLink">
                <Link href="/listings_preferences">You have no listings. Add one here.</Link>
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
                                <button onClick={() => router.push(`/edit_listing/${listing.listing_id}`)} className='listing-button'>Edit</button>
                                {!listing.is_private && (
                                    <button onClick={() => router.push(`/landlord_matches/${listing.listing_id}`)} className="listing-button">Start Matching</button>
                                )}
                                <button onClick={() => router.push(`/landlord_accepted_matches/${listing.listing_id}`)} className="listing-button">View Matches</button>
                                <button onClick={() => handleDelete(listing.listing_id)} className="listing-button">Delete</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        )}
    </div>
    )
}

export default AllListings;