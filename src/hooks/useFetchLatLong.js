import { useState } from 'react';

export const useFetchLatLong = () => {
  const [latLong, setLatLong] = useState({ latitude: null, longitude: null });
  const [locationError, setLocationError] = useState('');

  const fetchLatLong = async (location) => {
    setLocationError('');

    const locationPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ'-. ]+,\s*[A-Za-zÀ-ÖØ-öø-ÿ'-. ]+,\s*[A-Za-zÀ-ÖØ-öø-ÿ'-. ]+$/

    if (!location) { 
      setLocationError("No Location Given")
      return null; 
    }

    if (!locationPattern.test(location)) {
      setLocationError("Invalid location format. Use: City, Province, Country.");
      return null;
    }

    const locationParts = location.split(',').map(part => part.trim());
    const [city, province, country] = locationParts;

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${process.env.NEXT_PUBLIC_API_KEY}&no_annotations=1`
      );
      const geoData = await response.json();

      if (geoData.status.code !== 200 || geoData.results.length === 0) {
        setLocationError("Invalid location. Please enter a valid City, Province, Country.");
        return null;
      }

      const resultLocation = geoData.results[0].formatted;
      const resultParts = resultLocation.split(',').map(part => part.trim());

      if (resultParts.length !== 3 || !resultParts.includes(city) || !resultParts.includes(province) || !resultParts.includes(country)) {
          setLocationError("The location entered doesn't match our records. Please check and try again.");
          return null;
      }
      
      const { lat, lng } = geoData.results[0].geometry;
      setLatLong({ latitude: lat, longitude: lng });
      return { latitude: lat, longitude: lng };
      

    } catch (error) {
      console.error("Error fetching coordinates:", error);
      setLocationError("Error getting location & coordinates")
      return null;

    }
  };

  return { latLong, fetchLatLong, locationError };
};

