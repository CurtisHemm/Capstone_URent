// Import
import { useFetchUserSession } from "@/hooks/useFetchUserSession.js";
import { useState } from 'react';
import { useForm } from 'react-hook-form';

// Page for editing password
const EditPassword = () => {
    const { user } = useFetchUserSession();  
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Hook form functions
    const { 
        register, 
        handleSubmit, 
        watch,
        reset,
        formState: { errors } 
    } = useForm();

    // When user submits, compare original password to the password in the user table, hash new one and insert
    const onSubmit = async (data) => {
        setErrorMessage('');
        setSuccessMessage('');

        const { originalPassword, newPassword, confirmPassword } = data;

        if (newPassword != confirmPassword) {
            setErrorMessage("Password Confirmation doesn't match New Password");
            return;
        }

        const response = await fetch('/api/edit_password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.user_id, originalPassword, newPassword }),
        });

        const result = await response.json();

        if (response.ok) {
            setSuccessMessage('Password updated successfully');
            reset(); 
        } else {
            setErrorMessage(result.error || 'Something went wrong');
        }
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div className="loginContainer">
            <h2>Password Change</h2>

            {errorMessage && <div className='errorMessage'>{errorMessage}</div>}
            {successMessage && <div className='successMessage'>{successMessage}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='formStyle'>
                    <label>Original Password</label>
                    <input
                        type="password"
                        placeholder="Enter your original password"
                        {...register("originalPassword", { required: "Original password is required" })}
                    />
                    {errors.originalPassword && <p className="errorMessage">{errors.originalPassword.message}</p>}
                </div>

                <div className='formStyle'>
                    <label>New Password</label>
                    <input
                        type="password"
                        placeholder="Enter your new password"
                        {...register("newPassword", { required: "New password is required" })}
                    />
                    {errors.newPassword && <p className="errorMessage">{errors.newPassword.message}</p>}
                </div>

                <div className='formStyle'>
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        placeholder="Retype your new password to confirm"
                        {...register("confirmPassword", { 
                            required: "Password confirmation is required",
                            validate: value => value === watch("newPassword") || "Passwords do not match"
                        })}
                    />
                    {errors.confirmPassword && <p className="errorMessage">{errors.confirmPassword.message}</p>}
                </div>

                <button type="submit">Change Password</button>

            </form>

        </div>
    )
};

export default EditPassword;