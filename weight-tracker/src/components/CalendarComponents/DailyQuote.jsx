import useDailyQuote from "../../hooks/useDailyQuote";

const DailyQuote = () => {
  const { quote, loading, error } = useDailyQuote();

  if (loading) {
    return <p>Loading quote...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div>
      <p>{quote?.quote}</p>
    </div>
  );
};

export default DailyQuote;