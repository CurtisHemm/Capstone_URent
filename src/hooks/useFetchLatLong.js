// Import
import { useState } from 'react';

// Hook for fetching latitude and longitude 
export const useFetchLatLong = () => {
  const [latLong, setLatLong] = useState({ latitude: null, longitude: null });       // Store lat and long
  const [locationError, setLocationError] = useState('');                            // Store location error

  // Fetch lat and log of location parameter
  const fetchLatLong = async (location) => {
    setLocationError('');

    // For checking if location is city, province, country
    const locationPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ'-. ]+,\s*[A-Za-zÀ-ÖØ-öø-ÿ'-. ]+,\s*[A-Za-zÀ-ÖØ-öø-ÿ'-. ]+$/

    // If there is no location inputted, return error
    if (!location) { 
      const errorMessage = "No Location Given";
      setLocationError(errorMessage);
      return { error: errorMessage };
    }

    // If location fails pattern test
    if (!locationPattern.test(location)) {
      const errorMessage = "Invalid location format. Use: City, Province, Country.";
      setLocationError(errorMessage);
      return { error: errorMessage };
    }

    // Split the location into city, province, and country
    const locationParts = location.split(',').map(part => part.trim());
    const [city, province, country] = locationParts;

    // Fetch geolocator api with location parameter
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${process.env.NEXT_PUBLIC_API_KEY}&no_annotations=1`
      );
      const geoData = await response.json();

      // If fetch returns nothing
      if (geoData.status.code !== 200 || geoData.results.length === 0) {
        const errorMessage = "Invalid location. Please enter a valid City, Province, Country."
        setLocationError(errorMessage);
        return { error: errorMessage };
      }

      // Formats location data and split via the commas
      const resultLocation = geoData.results[0].formatted;
      const resultParts = resultLocation.split(',').map(part => part.trim());

      // If there isn't 3 parts, and checks for each part that it exists
      if (resultParts.length !== 3 || !resultParts.includes(city) || !resultParts.includes(province) || !resultParts.includes(country)) {
        const errorMessage = "The location entered doesn't match our records. Please check and try again.";
        setLocationError(errorMessage);
        return { error: errorMessage };
      }
      
      // Get and set the lat and long of the results
      const { lat, lng } = geoData.results[0].geometry;
      setLatLong({ latitude: lat, longitude: lng });
      return { latitude: lat, longitude: lng };
      

    } catch (error) { 
      // Catch Errors
      console.error("Error fetching coordinates:", error);
      const errorMessage = "Error getting location & coordinates";
      setLocationError(errorMessage);
      return { error: errorMessage };

    }
  };

  // Return the latitude and longitude 
  return { fetchLatLong };
};

