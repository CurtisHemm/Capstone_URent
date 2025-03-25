import { useState } from 'react';

export const useFetchLatLong = () => {
  const [latLong, setLatLong] = useState({ latitude: null, longitude: null });
  const [locationError, setLocationError] = useState('');

  const fetchLatLong = async (location) => {
    setLocationError('');

    const locationPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ'-. ]+,\s*[A-Za-zÀ-ÖØ-öø-ÿ'-. ]+,\s*[A-Za-zÀ-ÖØ-öø-ÿ'-. ]+$/

    if (!location) { 
      const errorMessage = "No Location Given";
      setLocationError(errorMessage);
      return { error: errorMessage };
    }

    if (!locationPattern.test(location)) {
      const errorMessage = "Invalid location format. Use: City, Province, Country.";
      setLocationError(errorMessage);
      return { error: errorMessage };
    }

    const locationParts = location.split(',').map(part => part.trim());
    const [city, province, country] = locationParts;

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${process.env.NEXT_PUBLIC_API_KEY}&no_annotations=1`
      );
      const geoData = await response.json();

      if (geoData.status.code !== 200 || geoData.results.length === 0) {
        const errorMessage = "Invalid location. Please enter a valid City, Province, Country."
        setLocationError(errorMessage);
        return { error: errorMessage };
      }

      const resultLocation = geoData.results[0].formatted;
      const resultParts = resultLocation.split(',').map(part => part.trim());

      if (resultParts.length !== 3 || !resultParts.includes(city) || !resultParts.includes(province) || !resultParts.includes(country)) {
        const errorMessage = "The location entered doesn't match our records. Please check and try again.";
        setLocationError(errorMessage);
        return { error: errorMessage };
      }
      
      const { lat, lng } = geoData.results[0].geometry;
      setLatLong({ latitude: lat, longitude: lng });
      return { latitude: lat, longitude: lng };
      

    } catch (error) {
      console.error("Error fetching coordinates:", error);
      const errorMessage = "Error getting location & coordinates";
      setLocationError(errorMessage);
      return { error: errorMessage };

    }
  };

  return { fetchLatLong };
};

