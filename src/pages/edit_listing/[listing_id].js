import { useFetchUserSession } from "@/hooks/useFetchUserSession.js";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

const PLACEHOLDER_IMG = 'https://enwbbyztboyashdtxocf.supabase.co/storage/v1/object/public/listing_images/pictures/placeholder.jpg';

const editListing = () => {
    const { user } = useFetchUserSession();

    const router = useRouter();
    const { listing_id } = router.query;
    const [photoUrl, setPhotoUrl] = useState(PLACEHOLDER_IMG);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const { 
        register, 
        handleSubmit, 
        setValue,
        reset,
        watch,
        formState: { errors } 
    } = useForm();

    const removeImage = watch("removeImage", false);

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

                setPhotoUrl(result.listings.photo_url || PLACEHOLDER_IMG);
                
                reset({
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

        let updatedPhotoUrl = photoUrl;

        try {
            const file = data.photo?.[0];

            if (removeImage) {
                updatedPhotoUrl = PLACEHOLDER_IMG;
            } else if (file) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadResponse = await fetch('/api/upload_img', {
                    method: 'POST',
                    body: formData,
                });

                const uploadResult = await uploadResponse.json();

                if (!uploadResponse.ok) { throw new Error(uploadResult.error || 'Image upload failed'); }

                updatedPhotoUrl = uploadResult.publicUrl;
            }

            const response = await fetch('/api/edit_listing', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: listing_id, data, photoUrl: updatedPhotoUrl})
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

                {photoUrl != PLACEHOLDER_IMG && <div className='formStyle'>
                    <label>
                        Remove Image?
                        <input type="checkbox" {...register("removeImage")} />
                    </label>
                </div> }

                <center>
                    <img src={photoUrl} alt="Listing Image" className="listing-img" />
                </center>
                    
                {!removeImage && <div className='formStyle'>
                    <label>Upload Image</label>
                    <input type='file' accept="image/jpeg" {...register('photo')} />
                </div>}

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