// Hook for when a requested match is updated. Either declined or accepted
export const useMatchUpdater = () => {
    // updateMatch function 
    const updateMatch = async ({ listing_id, preferenceId, matchType, matchNotes, onSuccess, setErrorMessage }) => {

        try {
            const matchResponse = await fetch('/api/decline_or_accept_match', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ listingId: listing_id, preferenceId: preferenceId, matchType: matchType, matchNotes: matchNotes })
            });

            const matchResult = await matchResponse.json();

            if (matchResponse.ok) {
                onSuccess();
            } else { setErrorMessage(matchResult.error || "Could not decline match."); }
        } catch (error) {
            console.error("Error declining tenant:", error);
            setErrorMessage("Error declining tenant.");
        }
    };

    // Return updateMatch function
    return { updateMatch };
}

