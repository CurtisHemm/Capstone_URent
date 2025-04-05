// Imports
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export const useFetchUserSession = () => {
    const [user, setUser] = useState(null);   // Stores user data
    const router = useRouter();               // Next.js router instance

    // Fetchs the user session, and if it doesn't exist, redirect to the login page
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

    // Return user data
    return { user };
};