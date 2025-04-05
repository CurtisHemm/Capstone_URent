// Import
import { useState, useEffect } from "react";

// Hook for fetching preferenceId of a userId
export const useFetchPreferenceId = (userId) => {
    const [preferenceId, setPreferenceId] = useState(null);    // Stores preference Id

    // Fetchs the get_preference api using the userId to get the preferenceId
    useEffect(() => {
        if (!userId) return;
        const fetchPreference = async () => {
            try {
                const response = await fetch(`/api/get_preference?userId=${userId}`);
                const result = await response.json();

                if (response.ok && result.preference) {
                    setPreferenceId(result.preference.preference_id);
                }
            } catch (err) {
                console.error("Error fetching preference ID:", err);
            }
        }

        fetchPreference();
    }, [userId])

    // Return the preference Id
    return { preferenceId };
};