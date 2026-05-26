import quotes from "../data/quotes.json" with { type: "json" };   //json data is stored to "quotes" and treat it explicitly as json data (using with)

export const getDailyQuote = () => {
  const day = new Date().getDate();
  
  return quotes[(day - 1) % quotes.length];                         //using day-1 to also access quotes[0] in certain cases
};