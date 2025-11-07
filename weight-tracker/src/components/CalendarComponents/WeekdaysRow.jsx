export default function WeekdaysRow({ weekDays }) {
  return (
    //--WEEKDAY HEADERS-- 
    <div className="weekdays">
      {weekDays.map(day => <div key={day}>{day}</div>)}
      <div>Average</div>        {/* Appending Avg column */}
    </div>
  );
}