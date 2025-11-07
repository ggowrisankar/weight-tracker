import DayCell from "./DayCell";

export default function CalendarGrid({
  weeks, year, month, currentDate, weights, errors, draft, weather,
  toggleWeather, handleWeightChange, handleInputValidation, calculateWeeklyAverage, freeEditMode
}) {
  return (
    <div className="calendar-grid">
      {/* --WEEKLY GRID-- */}
      {weeks.map((week, wIndex) => (                                          //Rendering week chunks one by one
        <div key={wIndex} className="week-row">
          {week.map((day, dIndex) => (                                        //Rendering each day inside each week chunk. Invalid days are grayed out.
            <DayCell
              key={`${year}-${month+1}-${day || `empty-${dIndex}`}`}
              day={day}
              month={month}
              year={year}
              currentDate={currentDate}
              weights={weights}
              draft={draft}
              errors={errors}
              weather={weather}
              toggleWeather={toggleWeather}
              handleWeightChange={handleWeightChange}
              handleInputValidation={handleInputValidation}
              freeEditMode={freeEditMode}
            />
          ))}
          <div className="weekly-average">
            {calculateWeeklyAverage(week, weights)}
          </div>
        </div>
      ))}
    </div>
  );
}