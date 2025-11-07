export default function DayCell({
  day, month, year, currentDate, weights, draft, errors,
  weather, toggleWeather, handleWeightChange, handleInputValidation, freeEditMode
}) {
  const isToday = day === currentDate.getDate() &&
                  month === currentDate.getMonth() &&
                  year === currentDate.getFullYear();

  const isEditable = freeEditMode || isToday;

  return (
    <div className={`day-cell ${!day ? "invalid" : ""} ${isToday ? "today-highlight" : ""} ${weights[day] ? "filled-day" : "empty-day"}`}>
      {day && (
        <>
          <div className="day-header">
            <div>{day}</div>
            {toggleWeather && weather[day]?.icon && (
              <img
                src={`https://openweathermap.org/img/wn/${weather[day].icon}.png`}
                alt={weather[day].description || "Weather icon"}
                title={weather[day].description || "Weather icon"}
                className="weather-icon"
              />
            )}
          </div>

          <div className={`tooltip-wrapper ${errors[day] ? "show" : ""}`}>
            <input
              type="number"
              value={draft[day] || ""}
              placeholder={errors[day] ? errors[day] : "kg"}
              className={`input ${errors[day] ? "invalid" : ""}`}
              onChange={(e) => handleWeightChange(day, e.target.value)}
              onBlur={(e) => handleInputValidation(day, e.target.value)}
              disabled={!isEditable}
            />
            <div className="tooltip">Invalid weight</div>
          </div>
        </>
      )}
    </div>
  );
}