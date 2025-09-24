import dotenv from "dotenv";                        //Environmental variable file fetch. Used for security and protecting sensitive infos like API keys.
dotenv.config();                                    //Loading variables from env. Always keep the import and configs at the top.
import express from "express";                      //Framework for creating web servers
import cors from "cors";                            //Importing CORS to bypass restrictions
import weatherRoutes from "./routes/weatherRoutes.js";
import mongoose from "mongoose";                    //Imporitng mongoose library to interact with MongoDB

//Connecting the backend to MongoDB server
mongoose.connect(process.env.MONGO_URI);            //Mongoose 6+ uses the new parser and unified topology by default.
/*, {            //Configuration for the connection (uri, options):
  useNewUrlParser: true,                             //uses the new URL parser (recommended by MongoDB)
  useUnifiedTopology: true                           //enables the new unified topology layer (improves connection handling & monitoring)
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.log("MongoDB connection error: ",err)); */

const app = express();                            //Our server
const PORT = process.env.PORT || 3000;            //Using available ports after checking in env. Server will be available at https://localhost:3000 as default.

app.use(cors());                                  //Now the server will be able to run anywhere without having to be inside the local url. (Keeping it open for now)

//Mount routes - prefix all paths inside weatherRoutes with /weather
app.use("/weather", weatherRoutes);               //For any request starting with /weather, use the router imported from weatherRoutes.js

//Starts the server
app.listen(PORT, () =>
  console.log(`Proxy running at http://localhost:${PORT}`)
);