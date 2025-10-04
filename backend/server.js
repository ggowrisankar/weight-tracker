import dotenv from "dotenv";                            //Environmental variable file fetch. Used for security and protecting sensitive infos like API keys.
dotenv.config();                                        //Loading variables from env. Always keep the import and configs at the top.
import express from "express";                          //Framework for creating web servers
import cors from "cors";                                //Importing CORS to bypass restrictions
import mongoose from "mongoose";                        //Importing mongoose library to interact with MongoDB
import weatherRoutes from "./routes/weatherRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import weightRoutes from "./routes/weightRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

//Connecting the backend to MongoDB server
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.log("MongoDB connection error: ",err));;
/*//Mongoose 6+ uses the new parser and unified topology by default.
, {                                                  //Configuration for the connection (uri, options):
  useNewUrlParser: true,                             //uses the new URL parser (recommended by MongoDB)
  useUnifiedTopology: true                           //enables the new unified topology layer (improves connection handling & monitoring)
});*/

const app = express();                              //Our server
const PORT = process.env.PORT || 3000;              //Using available ports after checking in env. Server will be available at https://localhost:3000 as default.

app.use(express.json());                            //Middleware to parse JSON

//app.use(express.urlencoded({ extended: true }));  //For accepting URL-encoded form data (form submissions)

app.use(cors());                                    //Now the server will be able to run anywhere without having to be inside the local url. (Keeping it open for now)

/*//Test User code
import bcrypt from "bcrypt";
import User from "./models/user.js";

async function  testUser() {
  try {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = new User({ email: "test@example.com", passwordHash: hashedPassword });
    await user.save();
    console.log("Test user created");
  }
  catch (err) {
    console.log("Test user creation error: ", err.message);
  }
}
testUser();*/

//Mount routes - prefix all paths inside weatherRoutes with /weather
app.use("/weather", weatherRoutes);                 //For any request starting with /weather, use the router imported from weatherRoutes.js

app.use("/auth", authRoutes);                       //Auth requests

app.use("/weights", authMiddleware, weightRoutes);  //Mount middleware once it hits the /weights request before redirecting to weightRoutes

//Starts the server
app.listen(PORT, () =>
  console.log(`Proxy running at http://localhost:${PORT}`)
);