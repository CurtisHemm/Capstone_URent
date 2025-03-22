import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useFetchLatLong } from '@/hooks/useFetchLatLong.js';

const PLACEHOLDER_PROFILE_IMG = 'https://enwbbyztboyashdtxocf.supabase.co/storage/v1/object/public/profile_images/pictures/placeholder.jpg';

const preferences = () => {
    const [user, setUser] = useState(null);  
    const [preferenceId, setPreferenceId] = useState(null);
    const [photoUrl, setPhotoUrl] = useState(PLACEHOLDER_PROFILE_IMG);
    const { fetchLatLong, locationError } = useFetchLatLong();
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    const { 
        register, 
        handleSubmit, 
        reset, 
        watch,
        formState: { errors } 
    } = useForm();

    const removeImage = watch("removeImage", false); 
    
    useEffect(() => {
        const fetchUserSession = async () => {
            const response = await fetch('/api/session', { credentials: 'include' });
            const data = await response.json();
            if (data.user) {
                setUser(data.user);  
                fetchUserPreferences(data.user.user_id);
            } else {
                router.push('/login');  
            }
        };
    
        fetchUserSession();
        }, [router]);

    const fetchUserPreferences = useCallback(async (userId) => {
        try {
            const response = await fetch(`/api/get_preference?userId=${userId}`);
            const result = await response.json();

            if (!response.ok || !result.preference) {
                console.error("Failed to fetch preferences", result);
                return;
            }

            console.log("✅ Preferences found! Updating state.");
            const pref = result.preference;
            setPreferenceId(pref.preference_id);
            setPhotoUrl(pref.photo_url || PLACEHOLDER_PROFILE_IMG);

            reset({
                preferredName: pref.preferred_name || '',
                photoUrl: pref.photo_url || '',
                location: pref.location || '',
                maxBudget: pref.max_budget || '',
                petsAllowed: pref.pets_allowed,
                bedCount: pref.bed_count || '',
                bathCount: pref.bath_count || '',
                smokingAllowed: pref.smoking_allowed,
                amenities: pref.amenities || '',
                profileBio: pref.profile_bio || '',
                preferencePrivate: pref.is_pref_private,
                removeImage: false,
            });

        } catch (error) {
            console.error("Error fetching preferences:", error);
        }
    },[reset]);

    const onSubmit = async (data) => {
        setErrorMessage('');
        setSuccessMessage('');

        let locationError = null;

        const latLong = await fetchLatLong(data.location);

        if (locationError) {
            setErrorMessage(locationError);
            return;
        }

        if (!latLong?.latitude || !latLong?.longitude) {
            setErrorMessage("Please provide a valid location to get coordinates.");
            return;
        }

        if (data.maxBudget < 0 ) {
            setErrorMessage('Budget must be a positive number');
        } 

        try {
            let newPhotoUrl = photoUrl;
            const oldPhotoUrl = (photoUrl && photoUrl !== PLACEHOLDER_PROFILE_IMG) 
            ? photoUrl 
            : PLACEHOLDER_PROFILE_IMG;

            if (data.removeImage && oldPhotoUrl !== PLACEHOLDER_PROFILE_IMG) {
                console.log('Preparing to delete img');
                
                const uploadType = oldPhotoUrl.includes('profile_images') ? 'preference' : 'listing';

                const deleteResponse = await fetch('api/delete_img', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({ photoUrl: oldPhotoUrl, uploadType})
                });

                if (!deleteResponse.ok) {
                    throw new Error('Failed to delete old image from storage');
                }

                newPhotoUrl = PLACEHOLDER_PROFILE_IMG;
                setPhotoUrl(newPhotoUrl);
                reset({ ...data, photo: null, removeImage: false });
            } 
            const file = data.photo?.[0];

            if (file) {
                
                const formData = new FormData();
                formData.append('file', file);
                formData.append('uploadType', 'preference');

                const uploadResponse = await fetch('/api/upload_img', {
                    method: 'POST',
                    body: formData,
                });

                const uploadResult = await uploadResponse.json();

                if (!uploadResponse.ok) { throw new Error(uploadResult.error || 'Image upload failed'); }

                newPhotoUrl = uploadResult.publicUrl;
                setPhotoUrl(newPhotoUrl);
            
            }

            const apiFileLocation = preferenceId ? `/api/edit_preference` : `/api/add_preference`;
            const responseMethod = preferenceId ? 'PUT' : 'POST';

            console.log(latLong.latitude);
            console.log(latLong.longitude);

            const response = await fetch(apiFileLocation, {
                method: responseMethod,
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    data, 
                    userId: user.user_id, 
                    preferenceId, 
                    photoUrl: newPhotoUrl,
                    latitude: latLong.latitude,
                    longitude: latLong.longitude
                  })
            });

            const result = await response.json();
            console.log("Server Response:", result);

            if (!response.ok) {
                setErrorMessage('Error: Could not save preferences');
            } else {
                setSuccessMessage('Preferences saved successfully!');
                if (!preferenceId) {
                    setPreferenceId(result.newPreference?.[0]?.preference_id || result.preference_id);
                }
            }
        } catch (error) {
            setErrorMessage('Error: Could Not Add preference');
            console.error("Preference Error:", error);
        }
    }

    if (!user) return <p>Loading...</p>;

    return (
        <div className='loginContainer'>
            <h2>{preferenceId ? "Edit Rental Preferences" : "Create Rental Preferences"}</h2>

            {errorMessage && <div className="errorMessage">{errorMessage}</div>}
            {successMessage && <div className="successMessage">{successMessage}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='formStyle'>
                    <label>
                        Remove/Edit Image?
                        <input type="checkbox" {...register("removeImage")} />
                    </label>
                </div>

                <center>
                    <img src={photoUrl} alt="Listing Image" className="listing-img" />
                </center>

                {removeImage && <div className='formStyle'>
                    <label>Upload Image</label>
                    <input type='file' accept="image/jpeg" {...register('photo')} 
                    onClick={(e) => e.target.value = null}
                     />
                </div>}

                <div className='formStyle'>
                    <label>Preferred Name</label>
                    <input {...register('preferredName')} placeholder='Enter your preferred display name' />
                </div>

                <div className='formStyle'>
                    <label>Preferred Location &#40;City, Province, Country&#41;</label>
                    <input
                        type="text"
                        placeholder="Enter city or address"
                        {...register('location', { required: 'Location is required' })}
                    />
                    {errors.location && <p className='error'>{errors.location.message}</p>}
                </div>

                <div className='formStyle'>
                    <label>Max Budget ($/month)</label>
                    <input type='number' {...register('maxBudget')} placeholder='Enter max budget' />
                </div>

                <div className='formStyle'>
                    <label>Pets Allowed</label>
                    <input type='checkbox' {...register('petsAllowed')} />
                </div>

                <div className='formStyle'>
                    <label>Bedrooms</label>
                    <input type='number' {...register('bedCount')} placeholder='Enter number of bedrooms' />
                </div>

                <div className='formStyle'>
                    <label>Bathrooms</label>
                    <input type='number' {...register('bathCount')} placeholder='Enter number of bathrooms' />
                </div>

                <div className='formStyle'>
                    <label>Smoking Allowed</label>
                    <input type='checkbox' {...register('smokingAllowed')} />
                </div>

                <div className='formStyle'>
                    <label>Amenities</label>
                    <input {...register('amenities')} placeholder='List preferred amenities' />
                </div>

                <div className='formStyle'>
                    <label>Profile Bio</label>
                    <textarea {...register('profileBio')} placeholder='Tell landlords about yourself' />
                </div>

                <div className='formStyle'>
                    <label>Keep Preferences Private</label>
                    <input type='checkbox' {...register('preferencePrivate')} />
                </div>

                <button type="submit">{preferenceId ? "Update Preferences" : "Save Preferences"}</button>
            </form>

        </div>
    )
}

export default preferences;