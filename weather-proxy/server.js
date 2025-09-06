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
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    res.json(data);                             //Forward API response to frontend
  } catch (err) {
    console.error("Proxy error: ",err.message);
    res.status(500).json({
      error: "Failed to fetch weather data",    //Forward a safe and consistent error msg to frontend
      details: err.message                      //We dont send this to frontend to keep the error msg consistent. Raw error may also contain sensitive infos so its not used.
    });
  }
});

app.listen(PORT, () => console.log(`Proxy running at http://localhost:${PORT}`));     //Starts the server