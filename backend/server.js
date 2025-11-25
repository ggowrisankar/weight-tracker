import dotenv from "dotenv";                            //Environmental variable file fetch. Used for security and protecting sensitive infos like API keys.
dotenv.config();                                        //Loading variables from env. Always keep the import and configs at the top.
import express from "express";                          //Framework for creating web servers
import cors from "cors";                                //Importing CORS to bypass restrictions
import mongoose from "mongoose";                        //Importing mongoose library to interact with MongoDB
import { globalLimiter } from "./utils/rateLimiters.js";
import pingRoute from "./routes/pingRoute.js";
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

/* Tell Express that our app is running behind one reverse proxy (Render's load balancer). 
This allows Express to trust the "X-Forwarded-*" headers that Render automatically adds to each incoming request. These headers contain important information such as:
- X-Forwarded-For: the original client's IP address
- X-Forwarded-Proto: the original request protocol (HTTP or HTTPS)

By default, Express does NOT trust these headers because they could be spoofed if the app were directly exposed to the internet. However, since Render always sits between the client and our app, we can safely trust the first proxy (Render itself).
This setting ensures that properties like req.ip, req.protocol, and req.secure
correctly reflect the real client connection details instead of the proxy’s internal ones. */
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;              //Using available ports after checking in env. Server will be available at https://localhost:3000 as default.

app.use(express.json());                            //Middleware to parse JSON
//app.use(express.urlencoded({ extended: true }));  //For accepting URL-encoded form data (form submissions)

//Whitelist - an array of origins (URLs) that are allowed to access backend (these 2 are allowed send requests)
const allowedOrigins = [
  "http://localhost:5173",
  "https://keepr-weight-tracker.vercel.app"
];
/*Applies the CORS middleware to every incoming request (middleware checks where the request is coming from and decides whether to allow it)
The browser automatically attaches headers like:
  Origin: https://keepr-weight-tracker.vercel.app
  Credentials: <cookies if credentials included>
The origin is then passed to an anonymous fn where callback is executed (handled by CORS library), which looks like:
  callback(error: Error | null, allow?: boolean)
*/
app.use(
  cors({
    origin: function (origin, callback) {
      //Allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      //Allow if origin is in the whitelist
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(globalLimiter);                             //Apply global rate limiter to all routes (In prod, 429 error should be handled gracefully in frontend)

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

//Mount routes
app.use("/ping", pingRoute);
app.use("/weather", weatherRoutes);                 //For any request starting with /weather, use the router imported from weatherRoutes.js
app.use("/auth", authRoutes);                       //Auth requests
app.use("/weights", authMiddleware, weightRoutes);  //Mount middleware once it hits the /weights request before redirecting to weightRoutes

//Starts the server
app.listen(PORT, () =>
  console.log(`Server running on port: ${PORT}`)
);