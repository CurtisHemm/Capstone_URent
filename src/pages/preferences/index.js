import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

const preferences = () => {
    const [user, setUser] = useState(null);  
    const [preferenceId, setPreferenceId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    const { 
        register, 
        handleSubmit, 
        reset, 
        formState: { errors } 
    } = useForm();
    
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

    const fetchUserPreferences = async (userId) => {
        try {
            const response = await fetch(`/api/get_preference?userId=${userId}`);
            const result = await response.json();

            console.log("API Response:", result); // Logs the full API response

            if (!response.ok) {
                console.error("Response not OK:", response.status, result);
                return;
            }

            if (!result.preference) {
                console.warn("No preference found in result");
                return;
            }

            console.log("✅ Preferences found! Updating state.");
            const pref = result.preference;
            setPreferenceId(pref.preference_id);
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
            });

        } catch (error) {
            console.error("Error fetching preferences:", error);
        }
    };

    const onSubmit = async (data) => {
        setErrorMessage('');
        setSuccessMessage('');

        if (data.maxBudget < 0 ) {
            setErrorMessage('Budget must be a positive number');
        } 

        try {
            const apiFileLocation = preferenceId ? `/api/edit_preference` : `/api/add_preference`;
            const responeMethod = preferenceId ? 'PUT' : 'POST';

            const response = await fetch(apiFileLocation, {
                method: responeMethod,
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ data, userId: user.user_id, preferenceId })
            });

            const result = await response.json();
            console.log("Server Response:", result);

            if (!response.ok) {
                setErrorMessage('Error: Could not save preferences');
            } else {
                setSuccessMessage('Preferences saved successfully!');
                if (!preferenceId) setPreferenceId(result.preference_id);
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
                    <label>Preferred Name</label>
                    <input {...register('preferredName')} placeholder='Enter your preferred display name' />
                </div>

                <div className='formStyle'>
                    <label>Prefered Location City</label>
                    <input {...register('location', { required: 'Location is required' })} placeholder='Enter city location' />
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