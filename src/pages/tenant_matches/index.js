// Imports
import { useFetchUserSession } from "@/hooks/useFetchUserSession.js";
import { useFetchPreferenceId } from "@/hooks/useFetchPreferenceId.js";
import { useState, useEffect } from 'react';  
import { motion } from "framer-motion";

// Page for tenant getting matches
const TenantMatches = () => {
    const { user } = useFetchUserSession();
    const { preferenceId } = useFetchPreferenceId(user?.user_id); 
    const [matchIndex, setMatchIndex] = useState(0);
    const [exitDirection, setExitDirection] = useState({ x: 0, y: 0 });
    const [isMatching, setIsMatching] = useState(false);
    const [matches, setMatches] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);

    const startMatching = async () => {
        setIsMatching(true);

        try {
            const fetchedMatches = await fetch(`/api/get_matches?preferenceId=${preferenceId}`)

            if (!fetchedMatches.ok) {
                console.log("Error fetching matches");
                return;
            } 

            const matchesResult = await fetchedMatches.json();
            console.log("Matches fetched:", matchesResult); 
            setMatches(matchesResult || []);
        } catch (error) {
            console.log("Error: ", error);
        }
        
    };

    const handleDrag = async (event, info) => {
        if (isAnimating) return;

        const { x, y } = info.offset; 
        const threshold = 100; 

        if (Math.abs(x) > Math.abs(y)) {
            if (x > threshold) {
                setIsAnimating(true);
                await handleAccept();
                
            } else if (x < -threshold) {
                setIsAnimating(true);
                await handleDecline();
            }
        } else {
            if (y < -threshold ) {
                setIsAnimating(true);
                handleSwipeUp();
            } else if (y > threshold ) {
                setIsAnimating(true);
                handleSwipeDown();
            }
        }
        
    };

    const handleAccept = async () => {
        const responseMethod = matches[matchIndex].isPending ? "PUT" : "POST";
        const apiFileLocation = matches[matchIndex]?.isPending ? `/api/accept_decline_match` : `api/request_match`;
        const enumType = matches[matchIndex].isPending ? "accepted" : "pendingTenant";

        try {
            const acceptResponse = await fetch(apiFileLocation, {
                method: responseMethod,
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    preferenceId, 
                    listingId: matches[matchIndex].listing_id,
                    enumType: enumType
                    })
            });

            if (acceptResponse.ok) {
                setExitDirection({ x: 1000, y: 0 });
                setTimeout(() => {
                    setMatches(prev => prev.filter((_, i) => i !== matchIndex));
                    setMatchIndex(prev => Math.min(prev, matches.length - 2));
                    setExitDirection({ x: 0, y: 0 });
                    setIsAnimating(false);
                }, 300);
            } else {
                console.error("Failed to accept the match");
                setIsAnimating(false);
            }
        } catch (error) {
            console.error("Error accepting match:", error);
            setIsAnimating(false);
        }
    };

    const handleDecline = async () => {
        const responseMethod = matches[matchIndex].isPending ? "PUT" : "POST";
        const apiFileLocation = matches[matchIndex]?.isPending ? `/api/accept_decline_match` : `api/request_match`;
        const enumType = "declined";

        try {
            const declineResponse = await fetch(apiFileLocation, {
                method: responseMethod,
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    preferenceId, 
                    listingId: matches[matchIndex].listing_id,
                    enumType: enumType
                    })
            });

            if (declineResponse.ok) {
                setExitDirection({ x: -1000, y: 0 });
                setTimeout(() => {
                    setMatches(prev => prev.filter((_, i) => i !== matchIndex));
                    setMatchIndex(prev => Math.min(prev, matches.length - 2));
                    setExitDirection({ x: 0, y: 0 });
                    setIsAnimating(false);
                }, 300);
            } else {
                console.error("Failed to decline the match");
                setIsAnimating(false);
            }
        } catch (error) {
            console.error("Error declining match:", error);
            setIsAnimating(false);
        }
    };

    const handleSwipeUp = () => {
        setExitDirection({ x: 0, y: -1000 });
        
        setTimeout(() => {
            setMatchIndex(prev => (prev + 1) % matches.length);
            setExitDirection({ x: 0, y: 0 });
            setIsAnimating(false);
        }, 300);
    };

    const handleSwipeDown = () => {
        setExitDirection({ x: 0, y: 1000 });
        
        setTimeout(() => {
            setMatchIndex(prev => (prev - 1 + matches.length) % matches.length);
            setExitDirection({ x: 0, y: 0 });
            setIsAnimating(false);
        }, 300);
    };

    if (!user) return <p>Loading...</p>;

    return (
        <>
        {preferenceId ? (
            !isMatching ? (
                <button onClick={startMatching} className="startMatchingButton">
                    Start Matching
              </button>
            ) : matches.length > 0 ? (
                <>
                <h2 className="matchPageText">Swipe Right to sent a match request, left to decline, up to move though, down to move back</h2>
                <div className="matchBoxContainer">
                    {matches[matchIndex] ? (
                        <motion.div 
                        key={`${matchIndex}-${matches[matchIndex].listing_id}`}
                        drag 
                        onDragEnd={handleDrag} 
                        dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }} 
                        initial={{ x: 0, y: 0, opacity: 0 }}
                        animate={{x: exitDirection.x, y: exitDirection.y, opacity: 1}}
                        exit={{ opacity: 0}}
                        transition={{ type: "spring", stiffness: 300, damping: 20, restDelta: 0.001 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }} 
                        className="matchBox">
                            <div className="matchContent">
                                <img 
                                    src={matches[matchIndex].photo_url} 
                                    alt="Listing Image" 
                                    className="listingImage"
                                />
                                <h2>{matches[matchIndex].street_address}, {matches[matchIndex].location}</h2>
                                <p><strong>Pending Request:</strong> {matches[matchIndex].isPending ? "Yes" : "No"}</p>
                                <p><strong>Compatibility Score:</strong> {matches[matchIndex].compatibilityScore}/6</p>
                                <p><strong>Price:</strong> ${matches[matchIndex].asking_price}</p>
                                <p><strong>Beds:</strong> {matches[matchIndex].bed_count} | <strong>Baths:</strong> {matches[matchIndex].bath_count}</p>
                                <p><strong>Amenities:</strong> {matches[matchIndex].amenities || "N/A"}</p>
                                <p><strong>Pets Allowed:</strong> {matches[matchIndex].pets_allowed ? "Yes" : "No"}</p>
                                <p><strong>Smoking Allowed:</strong> {matches[matchIndex].smoking_allowed ? "Yes" : "No"}</p>
                                <p><strong>Availability:</strong> {matches[matchIndex].availability}</p>
                                <p><strong>Description:</strong> {matches[matchIndex].listing_bio}</p>
                            </div>
                    </motion.div>
                    ) : (
                        <p>No more matches available.</p>
                    )}
                    </div>
                    </>
                    ) : (
                        <p>No matches found.</p>
                    ) 
        ) : ( 
            <p>No preferences found. Set your preferences to see matches.</p> 
        )}
        </>
    );


};

export default TenantMatches;