import { fetchWeatherData, transformWeatherData } from "../services/weatherService.js";
import weatherCache from "../models/weatherCache.js";

/*//To check the indexes of the schema
(async () => {
  const indexes = await weatherCache.collection.indexes();
  console.log("Indexes:", indexes);
})();
*/

//Controller: Handles incoming request and sends back transformed response
export async function getWeather(req, res) {
  console.log("Weather request query:", req.query);         //Logs queries
  try {
    const { city, lat, lon } = req.query;                    //Gets city query from URL. For eg: we need to send "?city=London" from frontend so it can be appended into the URL.
    
    //Validate location
    if (!city && !(lat && lon)) {
      return res.status(400).json({error: "No location provided" });
    }

    //Check if data is already cached
    let cached = await weatherCache.findOne({ city });
    if (cached) {
      console.log("Returning from MongoDB Cache");
      return res.json(cached.data);
    }
    
    //Fetch raw data from API
    const data = await fetchWeatherData({ city, lat, lon });

    //Transform data to the required format
    const transformedData = transformWeatherData(data);

    //Save the transformed data to cache
    const newCache = new weatherCache({
      city,
      data: transformedData,
      timestamp: new Date()
    });
    try{
      await newCache.save();
      console.log("Saved new data to MongoDB");
    }
    catch (savedError) {
      console.error("Failed to save cache", savedError);
    }

    //Send the transformed data as response
    res.json(transformedData);
  }
  catch (err) {
    console.error("Proxy error: ",err.message);
    res.status(500).json({
      error: "Failed to fetch weather data",    //Forward a safe and consistent error msg to frontend
      details: err.message                      //We dont send this to frontend to keep the error msg consistent. Raw error may also contain sensitive infos so its not used.
    });
  }
}