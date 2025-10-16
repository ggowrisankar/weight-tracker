// ---- Utility functions for calendar calculations ----

//Converting days array into chunks of weeks
export function chunkIntoWeeks(daysArray) {
const weeks = [];
  for (let i=0; i < daysArray.length; i += 7 ) {
    weeks.push(daysArray.slice(i, i + 7));
  }
  return weeks;
}

//Calculating Weekly average
export function calculateWeeklyAverage(week, weights) {
  const weekWeights = week
  .filter((day) => day !== null && weights[day])    //Filtering out only valid days with weights entered
  .map((day) => parseFloat(weights[day]));          //Converting string to num for performing calculations

  return weekWeights.length > 0
      ? (weekWeights.reduce((sum, val) => sum + val, 0) / weekWeights.length).toFixed(1)
      : null;  
}

//Calculating Monthly average
export function calculateMonthlyAverage(daysArray, weights) {
  const monthWeights = daysArray
    .filter((day) => day !== null && weights[day])
    .map((day) => parseFloat(weights[day]));

  return monthWeights.length > 0
    ? (monthWeights.reduce((sum, val) => sum + val, 0) / monthWeights.length).toFixed(1)
    : null;
}

//Checking if the month has ended
export function hasMonthEnded(currentDate, month, year) {
  return year < currentDate.getFullYear() ||
    (year === currentDate.getFullYear() && month < currentDate.getMonth())
}

//Clearing all stored values
export function clearLocalWeightData() {
  Object.keys(localStorage)
  .filter(key => key.startsWith("weights-"))
  .forEach(key => localStorage.removeItem(key));

  console.log("[Reset] Cleared localStorage weight inputs");
}