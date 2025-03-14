import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

const listings_preferences = () => {
    const [user, setUser] = useState(null);  
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    const { 
        register, 
        handleSubmit, 
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


        const onSubmit = async (data) => {
            setErrorMessage('');
            setSuccessMessage('');

            if (data.askingPrice < 0) {
                setErrorMessage('Asking price needs to be a positive number');
            }
    
            try {
                const response = await fetch('/api/add_listing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({ data, userId: user.user_id })
                });
    
                console.log(user.user_id);
                const result = await response.json();
                console.log("Server Response:", result);
    
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
                    <label>Photo URL</label>
                    <input type='text' {...register('photoUrl')} />
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