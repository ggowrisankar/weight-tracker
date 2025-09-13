import React, { useState, useEffect } from "react";
import useWeights from "../hooks/useWeights";
import useWeather from "../hooks/useWeather";
import { chunkIntoWeeks, calculateWeeklyAverage, calculateMonthlyAverage } from "../utils/calendarUtils";

function Calendar () {
  const[today,setToday] = useState(new Date());
  const year = today.getFullYear();
  const month = today.getMonth();           //Getting month in index form
  const currentDate = new Date();
//  const[currentMonth, setCurrentMonth] = useState(month);
//  const[currentYear, setCurrentYear] = useState(year);
  const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  //Get number of days in the current month
  const daysInMonth = new Date(year, month+1, 0).getDate(); //Using day "0" of next month gives last day of current month
//  const daysInMonth = new Date(currentYear, currentMonth+1, 0).getDate();
  
  //Align first day of the month as Mon-Sun (default Sun-Sat)
  const firstDay = new Date(year, month, 1).getDay();   //Returns the first day of the month (Sun-Mon) as indices 0-6
//  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const firstDayofMonth =  (firstDay + 6) % 7;        //Converting to Mon-Sun as indices 0-6

  //Build days array (nulls = empty slots before day 1)
  const daysArray = [
    ...Array(firstDayofMonth).fill(null),                  //Empty slots until the first day
    ...Array.from({length:daysInMonth}, (_,i) => i+1)     //Creating an array starting from 1 to total no of days
  ];

  //Checking if each week has 7 days. If not, rest are filled with nulls(blanks)
  while (daysArray.length % 7 !== 0) {
    daysArray.push(null);
  } 

  // --- Custom hooks ---
  const { weights, handleWeightChange } = useWeights(year, month);     // useWeights hook (weights stored in localStorage)
  const weather = useWeather(year, month);                             // useWeather hook (weather fetched + cached)
  
  //Previous & Next Month Navigation
/* function goToPreviousMonth() {
    if(currentMonth === 0) {
      setCurrentMonth(11);                  //December
      setCurrentYear(currentYear - 1);      //Previous year
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }
  function goToNextMonth() {
    if(currentMonth === 11) {
      setCurrentMonth(0);                   //January
      setCurrentYear(currentYear + 1);      //Next year
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }
*/

  function goToPreviousMonth() {
    setToday(new Date(year, month - 1, 1));   //(year, month, day)
  }
  function goToNextMonth() {
    setToday(new Date(year, month + 1, 1));
  }

  //Convert into weeks (using utils)
  const weeks = chunkIntoWeeks(daysArray);
  
  return(
    <div>
      {/* --MONTH + YEAR TITLE WITH NAVIGATION BUTTONS-- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <button onClick={goToPreviousMonth}>Prev</button>

        {/*<h2>{monthName[currentMonth]}, {currentYear}</h2>*/}
        <h2>{monthName[month]}, {year}</h2>
        {/*<h2>{new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })} {currentYear}</h2>*/}
        {/*<h2>{today.toLocaleString("default", {month: "long"})} {year}</h2>*/}  {/* Uses system local settings */}

        <button onClick={goToNextMonth}>Next</button>
      </div>
      
      {/* --WEEKDAY HEADERS-- */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",            //7 days + 1 avg column
        marginBottom: "10px",
        fontWeight: "bold",
        textAlign: "center"
        }}
      >
        {weekDays.map((day) => (
          <div key={day}>    
            {day}
          </div>
        ))}
        <div>Average</div>                                  {/* Appending Avg column */}
      </div>

      {/* --WEEKLY GRID-- */}
      <div>
        {weeks.map((week, wIndex) => (                    //Rendering week chunks one by one
          <div
            key={wIndex}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(8, 1fr)",     //7 days + 1 avg column
              textAlign: "center",
              gap: "5px",
              marginBottom: "10px"
            }}
          >
            {week.map((day, dIndex) => (                  //Rendering each day inside each week chunk. Invalid days are grayed out
              <div
                key={`${year}-${month+1}-${day || `empty-${dIndex}`}`}
                style={{
                  border: "1px solid gray",
                  padding: "10px",
                  backgroundColor: day ? "black" : "#f5f5f523",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
              >
                {day && (                                 //Rendering only if the days are valid > Input form is appended
                  <>
                    {/* Each component should be inside separate divs. Here day is under one, and input works on its own*/}
                    {/* Wrapping day and weather icon in one div with flexbox so it appears side by side, wheareas weight input will be displayed below */}
                    {/* Left - Day number */}
                    {<div 
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>{day}</div>
                    {/* Right - Weather icon */}
                    {(month === currentDate.getMonth() && year === currentDate.getFullYear())   //Added validations to only display weather icon for the current month & year.
                      && weather[day]?.icon && (                            //Optional chaining. Icon is only rendered if it exists in the backend.
                        <img 
                          src={`https://openweathermap.org/img/wn/${weather[day].icon}.png`} 
                          alt={weather[day].description || "Weather icon"}
                          title={weather[day].description || "Weather icon"}
                          style={{ width: "24px", height: "24px", marginLeft: "5px"}}
                        />
                      )}
                    </div>}

                    {/* Weight input (Always take full width)*/}
                    <input type="number"
                      placeholder="kg"
                      value={weights[day] || ""}
                      onChange={(e) => handleWeightChange(day, e.target.value)}
                      style={{
                        width: weather[day]?.icon ? "99%" : "100%",   //Shrink the size a bit if weather icon exists (Both currently set to 100)
                        marginTop: "5px"
                      }}
                    />
                  </>
                )}
              </div>
            ))}
            <div                                          //Weekly average box
              style={{
                display: "grid",
                placeItems: "center",
                border: "1px solid gray",
                padding: "10px",
                fontWeight: "bold",
                backgroundColor: "black",
              }}
            >
              {calculateWeeklyAverage(week, weights)}
            </div>
          </div>
        ))}
      </div>

      {/* --MONTHLY AVERAGE FIELD-- */}
      <div
        style={{ 
          textAlign: "center", 
          marginTop: "20px", 
          fontWeight: "bold" 
        }}>
        Monthly Average: {calculateMonthlyAverage(daysArray, weights)}
      </div>

      {/* --CALENDAR GRID-- */}
   {/*   
      <div style={{
          display: "grid", 
          gridTemplateColumns: "repeat(7, 1fr)", 
          textAlign: "center",
          gap: "5px"
        }}
      >
        {daysArray.map((day, index) => (
          <div
            key={`${year}-${month + 1}-${day || `empty-${index}`}`} //Unique key value yyyy-mm-dd / yyyy-mm-empty-0,1,2...
            style={{
              border: "1px solid gray",
              padding: "10px",
              backgroundColor: day ? "black" : "#f5f5f523", // Gray background for empty slots
              color: "white"
            }}
          >
            {day && (
              <>
                {<div style={{marginBottom: "5px"}}>{day}</div>}
                <input type="number"
                placeholder="kg"
                value={weights[day] || ""}
                onChange={(e)=> handleWeightChange(day, e.target.value)}
                style={{width: "100%", marginTop: "5px"}}
                />
              </>
            )}
          </div>
        ))}
      </div> 
   */}
      {/* Debug line to check useStates are working correctly */}
      {/*<pre>{JSON.stringify(weights, null, 2)}</pre>*/} 
    </div>
  );
}

export default Calendar;