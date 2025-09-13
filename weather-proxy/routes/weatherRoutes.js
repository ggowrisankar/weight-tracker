import express from "express";
import { getWeather } from "../controllers/weatherContoller.js";

const router = express.Router();

//Define route: /weather?city=London or /weather?lat=xx&lon=yy
router.get("/", getWeather);

export default router;