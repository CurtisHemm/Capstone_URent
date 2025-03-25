import { useFetchUserSession } from "@/hooks/useFetchUserSession.js";
import { useRouter } from 'next/router';

const dashboard = () => {
    const router = useRouter();
    const { user } = useFetchUserSession();  

    if (!user) return <p>Loading...</p>;

    return (
        <>
        <div className='dashboardContainer'>
        <h1 className="dashboardHeading">Welcome {user.first_name}, what kind of matches are you looking for?</h1>
            <div className="dashButtonContainer">
                <button className="dashButton">Find Listings</button>

                <button className="dashButton" onClick={() => router.push('/all_listings')}>Find Tenants</button>
            </div>
        </div>

        </>
    );
};

export default dashboard;