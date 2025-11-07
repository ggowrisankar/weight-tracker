export default function CalendarHeader({ month, year, monthName, goToPreviousMonth, goToNextMonth }) {
  return (
    //--MONTH + YEAR TITLE WITH NAVIGATION BUTTONS--
    <div className="calendar-header">
      <button onClick={goToPreviousMonth} title="Previous">🡨</button>
      <h2>{monthName[month]}, {year}</h2>
      {/*<h2>{today.toLocaleString("default", {month: "long"})} {year}</h2>*/}  {/* Uses system local settings */}
      <button onClick={goToNextMonth} title="Next">🡪</button>
    </div>
  );
}