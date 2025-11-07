export default function DayCell({
  day, month, year, currentDate, weights, draft, errors,
  weather, toggleWeather, handleWeightChange, handleInputValidation, freeEditMode
}) {
  const isToday = day === currentDate.getDate() &&
                  month === currentDate.getMonth() &&
                  year === currentDate.getFullYear();

  const isEditable = freeEditMode || isToday;

  return (
    //Template literal - day-cell is appended with invalid if day is falsy / Appended with today-highlight for current day.
    <div className={`day-cell ${!day ? "invalid" : ""} ${isToday ? "today-highlight" : ""} ${weights[day] ? "filled-day" : "empty-day"}`}>
      {day && (               //Rendering only if the days are valid > Input form is appended
        <>
          {/* Each component should be inside separate divs. Here day is under one, and input works on its own*/}
          {/* Wrapping day and weather icon in one div with flexbox so it appears side by side, wheareas weight input will be displayed below */}
          {/* Left - Day number */}
          <div className="day-header">
            <div>{day}</div>
            {/* Right - Weather icon */}
            {toggleWeather &&
            (month === currentDate.getMonth() && year === currentDate.getFullYear()) &&   //Added validations to only display weather icon for the current month & year.
            (weather[day]?.icon) && (                                                     //Optional chaining. Icon is only rendered if it exists in the backend.
              <img
                src={`https://openweathermap.org/img/wn/${weather[day].icon}.png`}
                alt={weather[day].description || "Weather icon"}
                title={weather[day].description || "Weather icon"}
                className="weather-icon"
              />
            )}
          </div>

          {/* Weight input (Always take full width)*/}
          {/* Only currentDate can be edited. Rest are disabled */}
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