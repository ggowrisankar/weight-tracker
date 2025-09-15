import dotenv from "dotenv";                        //Environmental variable file fetch. Used for security and protecting sensitive infos like API keys.
dotenv.config();                                    //Loading variables from env. Always keep the import and configs at the top.
import express from "express";                      //Framework for creating web servers
import cors from "cors";                            //Importing CORS to bypass restrictions
import weatherRoutes from "./routes/weatherRoutes.js";

const app = express();                            //Our server
const PORT = process.env.PORT || 3000;            //Using available ports after checking in env. Server will be available at https://localhost:3000 as default.

app.use(cors());                                  //Now the server will be able to run anywhere without having to be inside the local url. (Keeping it open for now)

//Mount routes - prefix all paths inside weatherRoutes with /weather
app.use("/weather", weatherRoutes);               //For any request starting with /weather, use the router imported from weatherRoutes.js

//Starts the server
app.listen(PORT, () =>
  console.log(`Proxy running at http://localhost:${PORT}`)
);