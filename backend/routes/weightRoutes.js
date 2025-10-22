import express from "express";
import { getAllWeightData, postAllWeightData, getWeightData, postWeightData, migrateWeightData, resetWeightData } from "../controllers/weightController.js";

const router = express.Router();

router.get("/", getAllWeightData);
router.post("/", postAllWeightData);

router.get("/:year/:month", getWeightData);
router.post("/:year/:month", postWeightData);

router.post("/migrate", migrateWeightData);

router.post("/reset", resetWeightData);

export default router;