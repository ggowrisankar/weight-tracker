import express from "express";
import { getTodayQuote } from "../controllers/quoteController.js";

const router = express.Router();

router.get("/today", getTodayQuote);

export default router;