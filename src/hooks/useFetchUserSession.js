import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export const useFetchUserSession = () => {
    const [user, setUser] = useState(null);
    const router = useRouter();

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

    return { user };
};