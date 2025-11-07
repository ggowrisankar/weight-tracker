export default function WeekdaysRow({ weekDays }) {
  return (
    <div className="weekdays">
      {weekDays.map(day => <div key={day}>{day}</div>)}
      <div>Average</div>
    </div>
  );
}