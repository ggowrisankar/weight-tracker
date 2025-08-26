function Calendar () {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const daysInMonth = new Date(year, month+1, 0).getDate(); //using day "0" of next month gives last day of current month
  const firstDay = new Date(year, month, 1).getDay();
  const firstDayofMonth =  (firstDay + 6) % 7; //using it to make Mon-Sun as indices 0-6

  const daysArray = [
    ...Array(firstDayofMonth).fill(null),                  //empty slots until the first day
    ...Array.from({length:daysInMonth}, (_,i) => i+1)     //creating an array starting from 1 to total no of days
  ];   

  return(
    <div>
      {/* Month + Year title */}
      {/* <h2>{monthName[month]}, {year}</h2> */}
      <h2>
        {today.toLocaleString("default", {month: "long"})} {year}
      </h2>

      {/* Weekday header */}
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

      {/* Calendar days */}
      <div style={{
          display: "grid", 
          gridTemplateColumns: "repeat(7, 1fr)", 
          textAlign: "center",
          gap: "5px"
        }}
      >
        {daysArray.map((day, index) => (
          <div
            key={`${year}-${month + 1}-${day || `empty-${index}`}`} //unique key value yyyy-mm-dd / yyyy-mm-empty-0,1,2...
            style={{
              border: "1px solid gray",
              padding: "10px",
              backgroundColor: day ? "black" : "#f5f5f523", // empty slots = gray
              color: "white"
            }}
          >
            {day || ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;