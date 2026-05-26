import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const useDailyQuote = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);

        const data = await apiFetch("/quotes/today", {}, false);
        console.log(data);
        setQuote(data);
      }
      catch (err) {
        console.error(err);
        setError("Failed to fetch quote");
      }
      finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  return {
    quote,
    loading,
    error
  };
};

export default useDailyQuote;