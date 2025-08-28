import React, { useState, useEffect } from "react";

function Calendar () {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();           //Getting month in index form
  const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  //Get number of days in the current month
  const daysInMonth = new Date(year, month+1, 0).getDate(); //Using day "0" of next month gives last day of current month
  
  //Align first day of the month as Mon-Sun (default Sun-Sat)
  const firstDay = new Date(year, month, 1).getDay();   //Returns the first day of the month (Sun-Mon) as indices 0-6
  const firstDayofMonth =  (firstDay + 6) % 7;        //Converting to Mon-Sun as indices 0-6

  //Build days array (nulls = empty slots before day 1)
  const daysArray = [
    ...Array(firstDayofMonth).fill(null),                  //Empty slots until the first day
    ...Array.from({length:daysInMonth}, (_,i) => i+1)     //Creating an array starting from 1 to total no of days
  ];   

  //Stores weight for each day
  const[weights, setWeights] = useState(() => {           //State: Store weights per day
    const saved = localStorage.getItem("weights");        //Load data from localstorage for first render
    return saved ? JSON.parse(saved) : {};
  });    

  //Load data from localstorage for first render - Code avoided since React Strict mode is enabled
/*  useEffect(() => {
    const saved = localStorage.getItem("weights");
    if (saved) {
      setWeights(JSON.parse(saved));
    }
  }, []);                     //[] - dependency to initially render
*/

  //Save to localstorage after any updation
  useEffect(() => {
    localStorage.setItem("weights", JSON.stringify(weights));
  }, [weights]);              //[weights] - dependency to update after every change

  //Handle input change
  const handleWeightChange = (day, value) => {      //Handler to update each weight
    setWeights((prev) => ({
      ...prev,
      [day]:value
    }))
  }

  return(
    <div>
      {/* Month + Year Title */}
      <h2>{monthName[month]}, {year}</h2>
      {/*<h2>{today.toLocaleString("default", {month: "long"})} {year}</h2>*/}  {/* Uses system local settings */}
      
      {/* Weekday headers */}
      <div style={{
        display: "grid", 
        gridTemplateColumns: "repeat(7, 1fr)", 
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
      </div>

      {/* Calendar grid */}
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
            {/* Only show if it's a valid day */}
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
      {/* Debug line to check useStates are working correctly */}
      {/*<pre>{JSON.stringify(weights, null, 2)}</pre>*/} 
    </div>
  );
}

export default Calendar;