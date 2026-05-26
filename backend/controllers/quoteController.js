import { getDailyQuote } from "../services/quoteService.js";

export const getTodayQuote = (req, res) => {
  try {
    const quote = getDailyQuote();

    res.status(200).json(quote);
  }
  catch (error) {
    console.log("Fetch weight error: ", error);
    res.status(500).json({ error: "Failed to fetch quote" });
  }
};