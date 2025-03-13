import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';   

const SignUp = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setErrorMessage("");
        setIsLoading(true);
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(data),
            });

            const result = await response.json();
            console.log("Server Response:", result);

            if (!response.ok) {
                console.error("Signup Error:", result); // Log the actual error response
                throw new Error(result.error || "Could not register user");
            }

            console.log("User registered:", result);

            router.push('/login');  

        } catch (error) {
            setErrorMessage('Error: Could Not Insert New User');
            console.error("Signup failed:", error);
            setIsLoading(false);
        }
    };


    return (
        <div className="loginContainer">
            <h2>URent Login</h2>
    
            {/* Error Message Display */}
            {errorMessage && <div className="errorMessage">{errorMessage}</div>}
    
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="formStyle">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="Enter your first name"
                        {...register("firstName", { required: "First name is required" })}
                    />
                    {errors.firstName && <p className="error">{errors.firstName.message}</p>}
                </div>

                <div className="formStyle">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        placeholder="Enter your last name"
                        {...register("lastName", { required: "Last name is required" })}
                    />
                    {errors.lastName && <p className="error">{errors.lastName.message}</p>}
                </div>

                <div className="formStyle">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        placeholder="Enter your phone number"
                        {...register("phoneNumber", {
                        required: "Phone number is required",
                        pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Phone number must be 10 digits",
                        },
                        })}
                    />
                    {errors.phoneNumber && <p className="error">{errors.phoneNumber.message}</p>}
                </div>

                <div className="formStyle">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        {...register("email", {
                        required: "Email is required",
                        pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "Invalid email format",
                        },
                        })}
                    />
                    {errors.email && <p className="error">{errors.email.message}</p>}
                </div>
    
                <div className="formStyle">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        {...register("password", {
                        required: "Password is required",
                        minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                        },
                        })}
                    />
                    {errors.password && <p className="error">{errors.password.message}</p>}
                </div>
    
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Signing Up..." : "Sign Up"}
                </button>
    
                <div className="signUpLink">
                    <Link href="/login">Already have an account? Log In Here</Link>
                </div>
                
            </form>
    
        </div>
      );

};

export default SignUp;