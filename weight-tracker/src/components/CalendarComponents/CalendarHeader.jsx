export default function CalendarHeader({ month, year, monthName, goToPreviousMonth, goToNextMonth }) {
  return (
    <div className="calendar-header">
      <button onClick={goToPreviousMonth} title="Previous">🡨</button>
      <h2>{monthName[month]}, {year}</h2>
      <button onClick={goToNextMonth} title="Next">🡪</button>
    </div>
  );
}