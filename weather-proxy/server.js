import express from "express";                       //Framework for creating web servers
import fetch from "node-fetch";                     //Allows us to use fetch in node.js
import dotenv from "dotenv";                        //Environmental variable file fetch. Used for security and protecting sensitive infos like API keys.

dotenv.config();                                    //Loading variables from env 

const app = express();                            //Our server
const PORT = process.env.PORT || 3000;            //Using available ports after checking in env.Server will be available at https://localhost:3000
const apiKey = process.env.API_KEY;               //Read API_KEY from env

// Define route. Simple endpoint: /weather?city=London
app.get("/weather", async(req, res) => {          //Execute the following function whenever https://localhost:3000/weather is ran
  const { city } = req.query;                    //Gets city query from URL. For eg: we need to send "city: London" from frontend so it can be appended into the URL.
//  const apiKey = "935b90efd6ee4001db49960beac2fcdf";

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);

  //Error Handling: [Note: response.status or headers don't require 'await' since its part of the metadata and is handled during fetch('url')]
    if (!response.ok) {
      if (response.status === 400) return res.status(400).json({error: "Bad Request"});
      if (response.status === 401) return res.status(401).json({error: "Invalid Key"});
      if (response.status === 404) return res.status(404).json({error: "'City' value missing"});

      return res.status(response.status).json({error: "Something went wrong"});     //Global error handler
    }
    
/*//Mapping method to avoid repetition of codes
   const errorMessages = {
    400: "Bad Request",
    401: "Invalid Key",
    404: "'City' value missing"
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
    res.json(data);                             //Forward valid API response to frontend
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