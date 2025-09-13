import { useState, useEffect } from "react";

// ---- Custom hook to manage weights ----
export default function useWeights(year, month) {
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
  };

  return { weights, handleWeightChange };
}