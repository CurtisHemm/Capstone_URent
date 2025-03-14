import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

const editListing = () => {
    const router = useRouter();
    const { listing_id } = router.query;
    const [user, setUser] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const { 
        register, 
        handleSubmit, 
        setValue,
        reset, 
        formState: { errors } 
    } = useForm();

    useEffect(() => {
        const fetchUserSession = async () => {
            const response = await fetch('/api/session', { credentials: 'include' });
            const data = await response.json();
            if (data.user) {
                setUser(data.user);  
            } else {
                router.push('/login');  
            }
        };
    
        fetchUserSession();
        }, [router]);

    useEffect(() => {
        if (!listing_id || !user) return;
    
        const fetchUserListings = async () => {
            try {
                const response = await fetch(`/api/get_listing_edit?listing_id=${listing_id}`);
                const result = await response.json();
    
                console.log("API Response:", result); // Logs the full API response
    
                if (!response.ok) {
                    setErrorMessage('Error fetching listing data');
                    return;
                }

                if (result.listings.user_id !== user.user_id) {
                    setErrorMessage("You are not authorized to edit this listing.");
                    return;
                }
                
    
                console.log("✅ Listing found! Updating state.");
                
                reset({
                    photoUrl: result.listings.photo_url || '',
                    streetAddress: result.listings.street_address || '',
                    listingLocation: result.listings.location || '',
                    askingPrice: result.listings.asking_price || '',
                    listingBedCount: result.listings.bed_count || '',
                    listingBathCount: result.listings.bath_count || '',
                    listingAmenities: result.listings.amenities || '',
                    listingPetsAllowed: result.listings.pets_allowed ?? false,
                    listingSmokingAllowed: result.listings.smoking_allowed ?? false,
                    availability: result.listings.availability || '',
                    listingBio: result.listings.listing_bio || '',
                    listingPrivate: result.listings.is_private ?? false
                })
            } catch (error) {
                console.error("Error fetching preferences:", error);
                setErrorMessage('Failed to load listing details.');
            }
        };

        fetchUserListings();
    }, [listing_id, user]);

    const onSubmit = async (data) => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await fetch('/api/edit_listing', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: listing_id, data})
            });

            const result = await response.json();

            if (!response.ok) {
                setErrorMessage(result.error || 'Failed to update listing');
                return;
            }

            setSuccessMessage('Listing updated successfully!');

            router.push('/all_listings');
        } catch (error) {
            console.error("Error updating listing:", error);
            setErrorMessage('Error updating listing');
        }
    };

    return (
        <div className='loginContainer'>
                <h2>Edit a listing</h2>

                {errorMessage && <div className="errorMessage">{errorMessage}</div>}
                {successMessage && <div className="successMessage">{successMessage}</div>}

                <form onSubmit={handleSubmit(onSubmit)}>
                <div className='formStyle'>
                    <label>Photo URL</label>
                    <input type='text' {...register('photoUrl')} />
                </div>

                <div className='formStyle'>
                    <label>Street Address</label>
                    <input type='text' {...register('streetAddress', { required: true })} />
                    {errors.streetAddress && <span>Street Address is required</span>}
                </div>

                <div className='formStyle'>
                    <label>City</label>
                    <input type='text' {...register('listingLocation', { required: true })} />
                </div>

                <div className='formStyle'>
                    <label>Asking Price</label>
                    <input type='number' {...register('askingPrice', { required: true })} />
                </div>

                <div className='formStyle'>
                    <label>Bedrooms</label>
                    <input type='number' {...register('listingBedCount', { required: true })} />
                </div>

                <div className='formStyle'>
                    <label>Bathrooms</label>
                    <input type='number' {...register('listingBathCount', { required: true })} />
                </div>

                <div className='formStyle'>
                    <label>Amenities</label>
                    <input type='text' {...register('listingAmenities', { required: true })} />
                </div>

                <div className='formStyle'>
                    <label>Pets Allowed</label>
                    <input type='checkbox' {...register('listingPetsAllowed')} />
                </div>

                <div className='formStyle'>
                    <label>Smoking Allowed</label>
                    <input type='checkbox' {...register('listingSmokingAllowed')} />
                </div>

                <div className='formStyle'>
                    <label>Availability</label>
                    <input type='date' {...register('availability')} />
                </div>

                <div className='formStyle'>
                    <label>Listing Bio</label>
                    <textarea {...register('listingBio')} />
                </div>

                <div className='formStyle'>
                    <label>Private Listing</label>
                    <input type='checkbox' {...register('listingPrivate')} />
                </div>

                <button type='submit'>Edit Listing</button>
            </form>
            </div>
    )
}

export default editListing;