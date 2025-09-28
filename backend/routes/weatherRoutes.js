import express from "express";
import { getWeather } from "../controllers/weatherContoller.js";

//Create a new router instance (acts like a mini Express app just for weather routes)
const router = express.Router();

//Define route: GET /weather?city=London or GET /weather?lat=xx&lon=yy. When this endpoint is hit, delegate the logic to getWeather(). ("/" - default if no url path)
router.get("/", getWeather);             //Passing the function as a callback so Express can run it later. Adding () will run it immediately and will break the code (undefined).

export default router;