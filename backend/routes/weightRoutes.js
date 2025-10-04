import express from "express";
import { getWeightData, postWeightData } from "../controllers/weightController.js";

const router = express.Router();

router.get("/:year/:month", getWeightData);
router.post("/:year/:month", postWeightData);

export default router;