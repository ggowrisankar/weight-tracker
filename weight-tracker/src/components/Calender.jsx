import React, { useState, useEffect } from "react";

function Calendar () {
  const[today,setToday] = useState(new Date());
  const year = today.getFullYear();
  const month = today.getMonth();           //Getting month in index form
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

//  const storageKey = `weights-${currentYear}-${currentMonth + 1}`; //month + 1 so Jan=1, Feb=2 ...
  const storageKey = `weights-${year}-${month + 1}`;

  //Stores weight for each day
  const[weights, setWeights] = useState(() => {           //State: Store weights per day
  //  const saved = localStorage.getItem("weights");        //Load data from localstorage for first render
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : {};
  });    

  //Load data from localstorage for first render - Code avoided since React Strict mode is enabled
/*  useEffect(() => {
    const saved = localStorage.getItem("weights");
    if (saved) {
      setWeights(JSON.parse(saved));
    }
  }, []);                     //[] - Dependency array to initially render and run only once
*/

  //Load data when month/year changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setWeights(saved ? JSON.parse(saved) : {});
  }, [storageKey]);

  //Save to localstorage after any updation
/*  useEffect(() => {
    localStorage.setItem("weights", JSON.stringify(weights));
  }, [weights]);              //[weights] - Dependency array to update after every change
*/
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(weights));
  }, [weights, storageKey]);     //Both are needed in the dependency array to ensure this runs when either changes. storageKey is added since its dynamic based on year/month and if it changes without a change in weights, the effect would not run unless it's listed. Including both ensures we always write to the correct key in localStorage.

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
    setToday(new Date(year, month - 1, 1));
  }
  function goToNextMonth() {
    setToday(new Date(year, month + 1, 1));
  }

  //Handle input change
/*  const handleWeightChange = (day, value) => {      //Handler to update each weight
    setWeights((prev) => ({
      ...prev,
      [day]:value
    }))
  }
*/

  const handleWeightChange = (day, value) => {
    setWeights((prev) => {
      const newWeights = {...prev, [day]:value};
      localStorage.setItem(storageKey, JSON.stringify(newWeights));
      return newWeights;
    });
  }

  //Converting days array into chunks of weeks
  const weeks = [];
  for (let i=0; i < daysArray.length; i += 7 ) {
    weeks.push(daysArray.slice(i, i + 7));
  }

  //Calculating Weekly average
  function calculateWeeklyAverage(week) {
    const weekWeights = week
    .filter((day) => day !== null && weights[day])    //Filtering out only valid days with weights entered
    .map((day) => parseFloat(weights[day]));          //Converting string to num for performing calculations

    return weekWeights.length > 0
        ? (weekWeights.reduce((sum, val) => sum + val, 0) / weekWeights.length).toFixed(1)
        : null;  
  }
  
  //Calculating Monthly average
  function calculateMonthlyAverage() {
    const monthWeights = daysArray
      .filter((day) => day !== null && weights[day])
      .map((day) => parseFloat(weights[day]));

    return monthWeights.length > 0
      ? (monthWeights.reduce((sum, val) => sum + val, 0) / monthWeights.length).toFixed(1)
      : null;
  }

  //Call Weather API to fetch weather details
  const [weather, setWeather] = useState({});
  useEffect(() => {
    const fetchWeather = async () => {      //Async function need to called separately since react expect useEffect to only return nothing or a cleanup function
      try {
        const response = await fetch("http://localhost:3000/weather?city=London");
        const data = await response.json();
        console.log("Weather Data:", data);
        setWeather(data);
      } catch (err) {
        console.error("Error fetching weather data: ", err);
      }
    };
    fetchWeather();
  }, []);                                 //Dependency [] to only run once during mount

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
                  color: "white"
                }}
              >
                {day && (                                 //Rendering only if the days are valid > Input form is appended
                  <>
                    {/* Each component should be inside separate divs. Here day is under one, and input works on its own*/}
                    {<div style={{marginBottom: "5px"}}>{day}</div>}
                    <input type="number"
                      placeholder="kg"
                      value={weights[day] || ""}
                      onChange={(e) => handleWeightChange(day, e.target.value)}
                      style={{width: "100%", marginTop: "5px"}}
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
              {calculateWeeklyAverage(week)}
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
        Monthly Average: {calculateMonthlyAverage()}
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