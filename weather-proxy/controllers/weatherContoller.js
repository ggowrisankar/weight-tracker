import { fetchWeatherData, transformWeatherData } from "../services/weatherService.js";

//Controller: Handles incoming request and sends back transformed response
export async function getWeather(req, res) {
  console.log("Weather request query:", req.query);         //Logs queries
  try {
    const { city, lat, lon } = req.query;                    //Gets city query from URL. For eg: we need to send "?city=London" from frontend so it can be appended into the URL.
    
    //Validate location
    if (!city && !(lat && lon)) {
      return res.status(400).json({error: "No location provided" });
    }
    
    //Fetch raw data from API
    const data = await fetchWeatherData({ city, lat, lon });

    //Transform data and send response
    const transformedData = transformWeatherData(data);
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