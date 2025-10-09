import express from "express";
import { getWeightData, postWeightData, migrateWeightData } from "../controllers/weightController.js";

const router = express.Router();

router.get("/:year/:month", getWeightData);
router.post("/:year/:month", postWeightData);

router.post("/migrate", migrateWeightData);

export default router;