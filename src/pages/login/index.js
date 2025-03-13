import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';   

const Login = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {

    // Reset error message
    setErrorMessage('');

    // When login begins
    setIsLoading(true);

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(data),
            credentials: 'include'
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Login failed');
        }

        console.log('User logged in:', result);

        router.push('/dashboard').then(() =>{
            window.location.reload();
        });

    } catch (error) {
        setErrorMessage(error.message || "Login failed");
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
                    {...register("password", { required: "Password is required" })}
                />
                {errors.password && <p className="error">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
            </button>

            <div className="signUpLink">
                <Link href="/sign_up">No Account? Sign Up Here</Link>
            </div>
            
        </form>

    </div>
  );
};

export default Login;