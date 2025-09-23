import { useState, useEffect } from "react";

// ---- Custom hook to manage weather ----
export default function useWeather(year, month, toggleWeather) {
  //Call Weather API to fetch weather details
  const [weather, setWeather] = useState({});

  useEffect(() => {
    if (toggleWeather) {
      const weatherKey = `weather-${year}-${month + 1}`;
      const savedWeather = localStorage.getItem(weatherKey);
      //Load cached weather immediately if present
      if (savedWeather) {
        setWeather(JSON.parse(savedWeather));
      }
      
      const fetchWeather = async (url) => {      //Async function need to be called separately since react expect useEffect to only return nothing or a cleanup function
        try {
          const response = await fetch(url);
          const data = await response.json();
          setWeather(data);
          localStorage.setItem(weatherKey, JSON.stringify(data));   //Save/Overwrite the key with fresh data
          //Note: In localStorage, new values will entirely overwrite/replace the original value of the key. It wont stack-up/append and the data will never be duplicated/repeated.
        } 
        catch (err) {
          console.error("Error fetching weather data: ", err);
        }
      };
      
      function getCurrentPositionPromise() {
        return new Promise((resolve, reject) => {               //getCurrentPosition returns undefined. Using a promise allows us to get the value outside the function using await.
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      }

      async function fetchWeatherDynamic() {
        try {
          //Geolocation API:
          const pos = await getCurrentPositionPromise();      //await only possible since its wrapped with promise. (only done for better readability instead of nesting)
          const url = `http://localhost:3000/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          await fetchWeather(url);
        }
        catch (geoErr) {
          console.error("Geolocation failed: ", geoErr);
          //Geolocation failed > Try IP lookup
          try {
            const ipRes = await fetch("https://ipapi.co/json/");
            const ipData = await ipRes.json();
            console.log("IP API Response:", ipData);
            if (ipData && ipData.city) {      //Or use ipData?.city for optional chaining
              const url = `http://localhost:3000/weather?city=${ipData.city}`;
              await fetchWeather(url);
              return;                         //To avoid fallback if lookup succeeds.
            }
          }
          catch (ipErr) {
            console.error("IP lookup failed: ",ipErr);
          }
          //IP lookup also fails > Fallback to default URL
          const defaultUrl = "http://localhost:3000/weather?city=Vazhuthacaud";    //Default url
          await fetchWeather(defaultUrl);
        }
      }
      
      fetchWeatherDynamic();
    }
  }, [month, year, toggleWeather]);                               //Dependency [] to only run once during mount. Add [<others>] if the render depends on its changes.

  return weather;
}