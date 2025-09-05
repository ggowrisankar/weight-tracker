import express from "express";                        //Framework for creating web servers
import fetch from "node-fetch";                     //Allows us to use fetch in node.js

const app = express();                            //Our server
const PORT = 3000;                                //Server will be available at https://localhost:3000

// Simple endpoint: /weather?city=London
app.get("/weather", async(req, res) => {
  const { city } = req.query;                    //Setting up req query. For eg: we need to send "city: London" from frontend so it can be appended into the URL.
  const apiKey = "935b90efd6ee4001db49960beac2fcdf";

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    res.json(data);                             //Forward API response to frontend
  } catch (err) {
    console.error("Proxy error: ",err.message);
    res.status(500).json({error: "Failed to fetch weather data"});  //Forward Internal Server Error msg to frontend
  }
});

app.listen(PORT, () => console.log(`Proxy running at http://localhost:${PORT}`));