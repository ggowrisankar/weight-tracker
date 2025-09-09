import express from "express";                       //Framework for creating web servers
import fetch from "node-fetch";                     //Allows us to use fetch in node.js
import dotenv from "dotenv";                        //Environmental variable file fetch. Used for security and protecting sensitive infos like API keys.

dotenv.config();                                    //Loading variables from env 

const app = express();                            //Our server
const PORT = process.env.PORT || 3000;            //Using available ports after checking in env.Server will be available at https://localhost:3000
const apiKey = process.env.API_KEY;               //Read API_KEY from env

// Define route. Simple endpoint: /weather?city=London
app.get("/weather", async(req, res) => {          //Execute the following function whenever https://localhost:3000/weather is ran
  try {
    const { city } = req.query;                    //Gets city query from URL. For eg: we need to send "city: London" from frontend so it can be appended into the URL.
    if(!city) {
      return res.status(400).json({error: "City is required"});
    }

    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);

    //Error Handling: [Note: response.status or headers don't require 'await' since its part of the metadata and is handled during fetch('url')]
    if (!response.ok) {
      if (response.status === 400) return res.status(400).json({error: "Bad Request"});
      if (response.status === 401) return res.status(401).json({error: "Invalid Key"});
      if (response.status === 404) return res.status(404).json({error: "Not found"});

      return res.status(response.status).json({error: "Something went wrong"});     //Global error handler
    }
    
    /*//Mapping method to avoid repetition of codes
   const errorMessages = {
    400: "Bad Request",
    401: "Invalid Key",
    404: "Not found"
   };
   if (!response.ok) {
    const errorMsg = errorMessages[response.status] || "Something went wrong";
    return res.status(response.status).json({error: errorMsg});
   }
    */

    /*//Error handler if the API provides proper error messages:
    if (!response.ok) {
    //API might have "error json" with keys like "code" or "message". So await is needed to ready the body.
    const errorData = await response.json().catch(() => ({}));;    //Safe parsing since we're calling await separately
    return res.status(response.status).json({error: errorData.message || "Something went wrong"});
    }
    */
    
    const data = await response.json();

    //--Data Transformation-- (To send only required data format to the front end)
    const today = new Date();
    const tomorrow = new Date();                //If we typed const tomorrow = new Date().setDate(today.getDate() + 1);, it will only return a timestamp
    tomorrow.setDate(today.getDate() + 1);      //Here since timestamp is not returned, we are getting the output back in the date object format

    const formatDate = (d) => d.toISOString().split("T")[0];    //Function to only get the date part

    //Filter out only the data for today and tomorrow
    const filteredData = data.list.filter(item => {
      const date = item.dt_txt.split(" ")[0];
      const time = item.dt_txt.split(" ")[1];
      return (
        (date === formatDate(today) || date === formatDate(tomorrow)) && time === "21:00:00"        //Originally need 06:00:00
      ); 
    });

    //Transform the data for today and tomorrow
    const transformedData = {};
    filteredData.forEach(item => {
      const day = new Date(item.dt_txt).getDate();
      transformedData[day] = {
        description: item.weather[0].main,
        icon: item.weather[0].icon
      };
    })

    // Create month/year key like "weather-2025-9"
    const monthKey = `weather-${today.getFullYear()}-${today.getMonth() + 1}`;      // +1 since months are index based
    res.json({ [monthKey]: transformedData });    //Forward valid API response to frontend

    /*//Transform Data to only send required code to the front end (Practice code)
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const filteredData = data.list.filter(item => 
      ((item.dt_txt.startsWith(today) || item.dt_txt.startsWith(tomorrow)) && item.dt_txt.split(" ")[1] === "06:00:00")
    );
    const finalData = filteredData.map(item => {
      return `${item.dt_txt} - ${item.main.temp}C - ${item.weather[0].main} - ${item.weather[0].description}`; 
    });
    res.json(finalData);
    */

    //  res.json(data);                             //Forward valid API response to frontend
  }
  catch (err) {
    console.error("Proxy error: ",err.message);
    res.status(500).json({
      error: "Failed to fetch weather data",    //Forward a safe and consistent error msg to frontend
      details: err.message                      //We dont send this to frontend to keep the error msg consistent. Raw error may also contain sensitive infos so its not used.
    });
  }
});

app.listen(PORT, () => console.log(`Proxy running at http://localhost:${PORT}`));     //Starts the server