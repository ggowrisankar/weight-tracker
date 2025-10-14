import { fetchAllWeightData, migrateWeightToServer } from "./weightApi";

//Function to check if token is valid. (Returns boolean)
export function isTokenValid(token) {
  if (!token) return false;

  try {
    //JWT has 3 Base64-encoded parts separated by dots (HEADERS.PAYLOAD.SIGNATURE)
    const payload = JSON.parse(atob(token.split(".")[1]));    //atob decodes Base64-encoded payload
    const now = Math.floor(Date.now() / 1000);                //Gets the current time in seconds (Date.now is in ms)
    return payload.exp > now;                                 //Compares payload expiry with current time (in seconds)
  }
  catch {
    return false;
  }
};

//Function to handle data migration 
export async function migrationHandler(setHasMigrated) {
  //Collect all local weight entires (To replace all "weights-" entries to "yyyy-mm" format so it can be sent for migration)
  const localWeightData = {};
  for (let i=0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key.startsWith("weights-")) {                         //Look for keys like "weights-yyyy-mm"
      const monthKey = key.replace("weights-", "");           //Replace keys to "yyyy-mm"
      const value = localStorage.getItem(key);

      try {
        localWeightData[monthKey] = JSON.parse(value);        //Store the value of old key to the new key if its not empty
      }
      catch {
        console.error("Failed to parse local weight data for ", key);
      }
    }
  }

  if (Object.keys(localWeightData).length > 0 && !localStorage.getItem("wt_migrated")) {
    try {
      const serverData = await fetchAllWeightData() || {};
      const localData = localWeightData;

      //Normalize both objects before comparing:
      const normalizedServer = normalizeData(stripEmptyMonthKeys(serverData));
      const normalizedLocal = normalizeData(stripEmptyMonthKeys(localData));

      const compareData = JSON.stringify(normalizedServer) === JSON.stringify(normalizedLocal);
      if (compareData) {
        console.log("No differences found. Skipping migration");
        localStorage.setItem("wt_migrated", "skip");
        return;
      }

      const userInput = window.prompt(
        `We found differences between your local and server weight data.\n\n` +
        `Choose how to proceed:\n` +
        `1 → Use local data only (overwrite server)\n` +
        `2 → Use server data only (discard local changes)\n` +
        `3 → Merge both (local overwrites matching days) [default]\n\n` +
        `Enter 1, 2, or 3:`
      );

      const choice = userInput?.trim() || "3";        //Fallback to merge (3) by default (trim used to clear out whitespaces for avoiding logical errors)
      let finalMergedData;

      switch (choice) {
        case "1":
          finalMergedData = localData;
          break;

        case "2":
          finalMergedData = serverData;
          break;

        default :
          finalMergedData = mergeWeightData(serverData, localData);
          break;
      }

      const shouldOverwrite = (choice === "1" || choice === "2");         //Overwrite flag to pass to the backend, to make sure local/server fully replaces data post updation
      await migrateWeightToServer(finalMergedData, shouldOverwrite);

      setHasMigrated(true);
      localStorage.setItem("wt_migrated", "true");                        //Migration flag to avoid re-running after every login
    }
    catch (err) {
      console.error("Migration failed: ", err);
    }
  }
};

//Remove empty monthKeys from raw local/server data
const stripEmptyMonthKeys = (data = {}) => {
  const cleaned = {};

  for (const [monthKey, value] of Object.entries(data)) {
    if (value && Object.keys(value).length > 0) {             //Check if value and key is not empty
      cleaned[monthKey] = value;
    }
  }

  return cleaned;
};

//Recursive function to sort object keys (like YYYY-MM and DD inside alphabetically) to make JSON comparison order-independent
const normalizeData = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;           //If input is not an object, return it as-is

  const sortedKeys = Object.keys(obj).sort();                        //Only get all keys of the object (YYYY-MM) and sort them alphabetically (ascending order)

  const result = {};
  for (const key of sortedKeys) {
    result[key] = normalizeData(obj[key]);                          //Recursively normalize each value in case it's also a nested object (here days are sorted alphabetically)
  }

  return result;
};

//Function to merge serverData with localData
const mergeWeightData = (server = {}, local = {}) => {
  const merged = {...server};        //Copies server data to merged to not mutate the original

  for (const monthKey in local) {    //Loop through each monthKey in local data
    if (!merged[monthKey]) {         //If the monthKey doesn't exist in the merged (i.e., server) data
      merged[monthKey] = {};         //Create that monthKey with an empty object
    }

    merged[monthKey] = {             //Merge the server and local data for that month
      ...merged[monthKey],           //Include existing values (from server or previously merged)
      ...local[monthKey]             //Overwrite or add values from local data
    };
  }

  return merged;                     //Return the final merged weight data object
};