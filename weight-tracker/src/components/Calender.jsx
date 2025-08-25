function Calendar () {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(year, month+1, 0).getDate(); //using the last day of next month to get the total days

  const days = Array.from({length:daysInMonth}, (_,i) => i+1);

  return(
    <div>
      <h2>{monthName[month]}, {year}</h2>

      <div style={{display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px"}}>
        {days.map((day) => (
          <div
            key={day}
            style={{
              border: "1px solid gray",
              padding: "10px",
              textAlign: "center"
            }}>
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;