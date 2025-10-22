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

//Storage Key helpers (ownerId: string like "guest" or the logged-in user's id)
export function storageKeyFor(ownerId, year, month) {
  return `weights-${ownerId}-${year}-${String(month).padStart(2, "0")}`;        //Month is always a 2-digit no. (01, 02...)
}

//List all local keys based on userId or guest
export function getAllKeysForOwner(ownerId) {
  const keys = [];
  for (let i = 0; i < localStorage.length ; i++) {
    const key = localStorage.key(i);

    if (key && key.startsWith(`weights-${ownerId}-`)) {
      keys.push(key)
    }
  }

  return keys;
}

//Clearing all stored weights for specific user or guest
export function clearLocalWeightData(ownerId = null) {
  /*Object.keys(localStorage)
    .filter(key => {
      if (!key) return;
      if (ownerId) {
        return key.startsWith(`weights-${ownerId}-`);
      }
      return key.startsWith("weights-");                //Fallback: clear all weights-* for safety (existing logic)
    })
    .forEach(key => localStorage.removeItem(key));
    */
  const keysToRemove = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (ownerId) {
      if (key.startsWith(`weights-${ownerId}-`)) keysToRemove.push(key);
    } else {
      if (key.startsWith("weights-")) keysToRemove.push(key);
    }
  }

  for (const k of keysToRemove) localStorage.removeItem(k);

  console.log(`[Reset] Cleared localStorage weights ${ownerId ? `for ${ownerId}` : "for all"}`);
}