import { useFetchUserSession } from "@/hooks/useFetchUserSession.js";
import { useFetchPreferenceId } from "@/hooks/useFetchPreferenceId.js";
import { useRouter } from 'next/router';
import { motion } from "framer-motion";

const dashboard = () => {
    const router = useRouter();
    const { user } = useFetchUserSession();  
    const { preferenceId } = useFetchPreferenceId(user?.user_id);

    if (!user) return <p>Loading...</p>;

    return (
        <>
        <div className='dashboardContainer'>
        <h1 className="dashboardHeading">Welcome {user.first_name}, what kind of matches are you looking for?</h1>
            <div className="dashButtonContainer">
                <motion.button 
                    whileHover={{ scale: 1.1 }} 
                    className="dashButton"
                    onClick={() => router.push(preferenceId ? '/tenant_matches' : '/preferences')}>
                        Find Listings
                </motion.button>

                <motion.button 
                    whileHover={{ scale: 1.1 }} 
                    className="dashButton" 
                    onClick={() => router.push('/all_listings')}>
                        Find Tenants
                </motion.button>
            </div>
        </div>

        </>
    );
};

export default dashboard;