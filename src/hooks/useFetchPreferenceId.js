import { useState, useEffect } from "react";

export const useFetchPreferenceId = (userId) => {
    const [preferenceId, setPreferenceId] = useState(null);

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

    return { preferenceId };
};