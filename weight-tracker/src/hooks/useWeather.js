import { useState, useEffect } from "react";
import { getCachedWeather, fetchWeather, getCurrentPositionPromise } from "../utils/weatherUtils";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ---- Custom hook to manage weather ----
export default function useWeather(year, month, toggleWeather) {
  //Call Weather API to fetch weather details
  const [weather, setWeather] = useState({});

  useEffect(() => {
    if (!toggleWeather) return;       //Below code only executes if toggleWeather is true

/*  Obsolete since now caching is done for City + Refresh/6hr logic.
    const weatherKey = `weather-${year}-${month + 1}`;
    const savedWeather = localStorage.getItem(weatherKey);
    //Load cached weather immediately if present
    if (savedWeather) {
      setWeather(JSON.parse(savedWeather));
      return;
    }*/

    async function fetchWeatherDynamic() {
      let cacheKey;
      try {
        //Geolocation API:
        const pos = await getCurrentPositionPromise();      //await only possible since its wrapped with promise. (only done for better readability instead of nesting)

        cacheKey = `weather-${pos.coords.latitude}-${pos.coords.longitude}`;
        const cachedData = getCachedWeather(cacheKey);
        if (cachedData) {
          console.log("Using cached weather (geolocation)");
          setWeather(cachedData);
          return;
        }
      
        const url = `${API_BASE}/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
        await fetchWeather(url, cacheKey, setWeather);
      }
      catch (geoErr) {
        console.error("Geolocation failed: ", geoErr);
        //Geolocation failed > Try IP lookup
        try {
          const ipRes = await fetch("https://ipapi.co/json/");
          const ipData = await ipRes.json();
          console.log("IP API Response:", ipData);

          if (ipData && ipData.city) {      //Or use ipData?.city for optional chaining

            cacheKey = `weather-${ipData.city}`;
            const cachedData = getCachedWeather(cacheKey);
            if (cachedData) {
              console.log("Using cached weather (IP city)");
              setWeather(cachedData);
              return;
            }

            const url = `${API_BASE}/weather?city=${ipData.city}`;
            await fetchWeather(url, cacheKey, setWeather);
            return;                         //To avoid fallback if lookup succeeds.
          }
        }
        catch (ipErr) {
          console.error("IP lookup failed: ",ipErr);
        }
        //IP lookup also fails > Fallback to default URL
        const defaultCity = "Thiruvananthapuram";
        
        cacheKey = `weather-${defaultCity}`;
        const cachedData = getCachedWeather(cacheKey);
        if(cachedData) {
          console.log("Using cached weather (default)");
          setWeather(cachedData);
          return;
        }

        const defaultUrl = `${API_BASE}/weather?city=${defaultCity}`;    //Default url
        await fetchWeather(defaultUrl, cacheKey, setWeather);
      };
    }
    
    fetchWeatherDynamic();

  }, [toggleWeather]);                   //Dependency [] to only run once during mount. Add [<others>] if the render depends on its changes.

  return weather;
}