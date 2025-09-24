// ---- Utility functions for weather caching ----

//Validate cache timestamp (default expiry = 6 hours
const isCacheValid = (timestamp, expiryMs = 6 * 60 * 60 * 1000) =>                    //expiryMs is an optional parameter since a default value is assigned.
  Date.now() - timestamp < expiryMs;

//Get cached weather data safely
export const getCachedWeather = (cacheKey) => {
  try {
    const cached = localStorage.getItem(cacheKey);
    if(!cached) return null;        //Nothing in localStorage
  
    const { data, timestamp } = JSON.parse(cached);

    //If still fresh, return data
    if (isCacheValid(timestamp)) {
      return data;
    }

    //Expired > clear it and return null
    localStorage.removeItem(cacheKey);
    return null;
  }
  catch (err) {
    console.error("Error reading cache: ", err);
    return null;                 //If parsing fails (corrupt JSON, etc.), just ignore cache
  }
}

//Async function need to be called separately since react expect useEffect to only return nothing or a cleanup function
export const fetchWeather = async (url, cacheKey, setWeather) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    setWeather(data);
    localStorage.setItem(                            //Save/Overwrite the key with fresh data
      cacheKey,
      JSON.stringify({ data, timestamp: Date.now() })
    );
    //Note: In localStorage, new values will entirely overwrite/replace the original value of the key. It wont stack-up/append and the data will never be duplicated/repeated.
  } 
  catch (err) {
    console.error("Error fetching weather data: ", err);
  }
};

export function getCurrentPositionPromise() {
  return new Promise((resolve, reject) => {               //getCurrentPosition returns undefined. Using a promise allows us to get the value outside the function using await.
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}