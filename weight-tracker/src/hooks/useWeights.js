import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { fetchWeightData, saveWeightData } from "../utils/weightApi";

// ---- Custom hook to manage weights ----
export default function useWeights(year, month) {
  //  const storageKey = `weights-${currentYear}-${currentMonth + 1}`; //month + 1 so Jan=1, Feb=2 ...
  const storageKey = `weights-${year}-${month + 1}`;

  const { isAuthenticated, hasMigrated } = useAuth();                     //Get isAuthenticated boolean value from AuthContext
  const [loading, setLoading] = useState(false);             //For loading status while fetching data
  const [saveStatus, setSaveStatus] = useState("idle");      //For saving status while saving data

  //Stores weight for each day
  const[weights, setWeights] = useState(() => {             //State: Store weights per day
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
/*useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setWeights(saved ? JSON.parse(saved) : {});
  }, [storageKey]);
*/
  useEffect(() => {
    async function loadWeightData() {
      setLoading(true);
      try {
        //Immediately render local storage data.
        const localData = localStorage.getItem(storageKey);
        setWeights(localData ? JSON.parse(localData) : {});

        //If logged in, also fetch from the server.
        if (isAuthenticated) {
          if (!hasMigrated) return;                                           //Ensures stale values are not rendered (to reflect new data post migration)

          const serverData = await fetchWeightData(year, month + 1);
          
          //Merge/Overwrite server data to local storage.
          if (Object.keys(serverData || {}).length > 0) {                     //Checks if serverData is an empty object
            //Default: prefer server data
            setWeights(serverData);
            localStorage.setItem(storageKey, JSON.stringify(serverData));
          }
        }
      }
      catch (err) {
        console.error("Error fetching server weights: ", err);
      }
      finally {
        setLoading(false);                                                     //setLoading runs even if fetchWeightData throws error
      }
    }   
    loadWeightData();
  }, [year, month, isAuthenticated, hasMigrated]);

  //Save to localstorage after any updation
/*useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(weights));
  }, [weights, storageKey]);     //Both are needed in the dependency array to ensure this runs when either changes. storageKey is added since its dynamic based on year/month and if it changes without a change in weights, the effect would not run unless it's listed. Including both ensures we always write to the correct key in localStorage.
*/
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(weights));

    let debounceTimeout;
    let idleResetTimeout;

    if (isAuthenticated) {
      setSaveStatus("saving");                              //When user changes weight, mark as "saving..."

      debounceTimeout = setTimeout(async () => {           //Async is used so await can be used for saveWeightData and in turn use try-catch
        try {
          const dataSaved = await saveWeightData(year, month + 1, weights);
          
          if (dataSaved.message === "Data saved") {
            setSaveStatus("saved");
            idleResetTimeout = setTimeout(() => setSaveStatus("idle"), 1500);  //“saved” flashes for 2 seconds, then hides (Reset back to idle after 2 second)
          }
        }
        catch (err) {
          console.error("Error saving user weights to the server: ", err);
          setSaveStatus("error");
        }
      }, 3000);                                   //Waits 3s after user stops editing, then executes save
    }

    return () => {                                //Separate cleanups: to clear the timeouts to prevent memory leaks or unwanted saves if dependencies change
      clearTimeout(debounceTimeout);
      clearTimeout(idleResetTimeout);        
    } 
  }, [weights, year, month, isAuthenticated]);

  //Handle input change
/*  const handleWeightChange = (day, value) => {      //Handler to update each weight
    setWeights((prev) => ({
      ...prev,
      [day]:value
    }))
  }
*/

  //--Input Error Validation logic (along with Input Handling)--
  //Errors are stored for each day. Should always be at the top otherwise it'll be empty always due to re-renders.
  const [errors, setErrors] = useState({});

  //For clearing any validation errors when switching months or years. Prevents stale error messages from showing on days of other months.
  useEffect(() => {
    setErrors({});
  }, [month, year]);

  //Adding a draft state to temporarily store invalid values, so other calculations aren't affected (like avg).
  const [draft, setDraft] = useState({});        
  
  //Keep draft in sync with weights whenever the month/year changes. This ensures that weight inputs reflect the correct data for the selected month.
  useEffect(() => {
    setDraft(weights);
  }, [weights]);

  const handleWeightChange = (day, value) => {
    /*Using drafts to temporarily store the state values
    //Always update weights first (allow empty/partial input), then validate, so typing and backspacing aren’t blocked by validation.
    setWeights((prev) => {
        const newWeights = {...prev, [day]: value };                           //Update only this day's weight
        localStorage.setItem(storageKey, JSON.stringify(newWeights));         //Persist
        return newWeights;                                                    //New state
      });
    */
      setDraft((prev) => ({
        ...prev,
        [day]: value
      }));
  };

  const handleInputValidation = (day, value) => {
    const inputNumericValue = parseFloat(value);
    //Case 1: Handle empty input (via backspacing) & Valid weight range (between 30–300 kg):
    if (value === "" || (!isNaN(inputNumericValue) && inputNumericValue >= 30 && inputNumericValue <= 300)) {
      //Remove any previous error for this day (if it exists) from the `errors` object
      setErrors((prev) => {
        const { [day]: _, ...rest } = prev;                                  //Destructure out current day's error (_ contains value of [day] but we don't need it - syntax)
        return rest;                                                         //Return remaining errors (effectively removing today's error) & becomes new state
       /* What's happening inside destructure:
          [day]: _ >> picks out the key we want to remove (we ignore its value with _).
          ...rest >> collects all remaining keys/values into a new object.
          return rest >> new object without that day’s key.

          //Make a shallow copy of the previous errors
          const rest = { ...prev };
          //Remove the error for this day
          delete rest[day];
          //Return the updated object
          return rest;

          If the same object (prev) is returned, React thinks nothing has changed, even though a propert was deleted.
          As a result: The component might not re-render, so the UI could still show the old error. Also it should be immutable.
          Always create and return a new object/array to trigger re-render.
        */
      });
          
      if (value === "") {
        setWeights((prev) => {
          const { [day]: _, ...rest } = prev;                                  //Removes the day key with empty value      
          localStorage.setItem(storageKey, JSON.stringify(rest));
          return rest;
        });
      }
      else { 
        //Store the valid values in the weights state
        setWeights((prev) => {
          const newWeights = {...prev, [day]: value };                          //Update only this day's weight
          localStorage.setItem(storageKey, JSON.stringify(newWeights));         //Persist
          return newWeights;                                                    //New state
        });
      }
    }
    //Case 2: Invalid weight — add/update error message for this day:
    else {
      setErrors((prev) => ({
        ...prev,                                                              //Keep other/existing errors untouched
        [day]: "Only 30-300kgs"
      }));
    }
  }

  return { weights, handleWeightChange, errors, draft, handleInputValidation, loading, saveStatus };
}