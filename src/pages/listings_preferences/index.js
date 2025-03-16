import { useFetchUserSession } from "@/hooks/useFetchUserSession.js";
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

const listings_preferences = () => {
    const { user } = useFetchUserSession();  

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm();

    const onSubmit = async (data) => {
        setErrorMessage('');
        setSuccessMessage('');

        if (data.askingPrice < 0) {
            setErrorMessage('Asking price needs to be a positive number');
        }

        try {

            let photoUrl = 'https://enwbbyztboyashdtxocf.supabase.co/storage/v1/object/public/listing_images/pictures/placeholder.jpg'
            
            const file = data.photo[0];

            if (file) {

                const formData = new FormData();
                formData.append('file', file);

                const uploadResponse = await fetch('/api/upload_img', {
                    method: 'POST',
                    body: formData,
                });

                const uploadResult = await uploadResponse.json();

                if (!uploadResponse.ok) {
                    throw new Error(uploadResult.error || 'Image upload failed');
                }

                const photoUrl = uploadResult.publicUrl;
            }

            const response = await fetch('/api/add_listing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ data, userId: user.user_id, photoUrl })
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("Listing Error:", result); 
                setErrorMessage('Error: Could Not Add listing');
                return;
            }

            console.log("Listing Added:", result);
            
            router.push('/all_listings');  
        } catch (error) {
            setErrorMessage('Error: Could Not Add Listing');
            console.error("Listing Error:", error);
        }
    }

    if (!user) return <p>Loading...</p>;

    return (
        <div className='loginContainer'>
            <h2>Add a listing</h2>

            {errorMessage && <div className="errorMessage">{errorMessage}</div>}
            {successMessage && <div className="successMessage">{successMessage}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
            <div className='formStyle'>
                <label>Upload Image</label>
                <input type='file' accept="image/jpeg" {...register('photo')} />
            </div>

            <div className='formStyle'>
                <label>Street Address</label>
                <input type='text' {...register('streetAddress', { required: true })} />
                {errors.streetAddress && <span>This field is required</span>}
            </div>

            <div className='formStyle'>
                <label>City</label>
                <input type='text' {...register('listingLocation', { required: true })} />
                {errors.listingLocation && <span>This field is required</span>}
            </div>

            <div className='formStyle'>
                <label>Asking Price</label>
                <input type='number' {...register('askingPrice', { required: true, min: 0 })} />
                {errors.askingPrice && <span>Must be a positive number</span>}
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
                <input type='text' {...register('listingAmenities')} />
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

            <button type='submit'>Add Listing</button>
        </form>
        </div>
    )
}

export default listings_preferences;