import { fetchAllWeightData, saveAllWeightData, migrateWeightToServer, clearServerWeightData } from "./weightApi";
import { getAllKeysForOwner, clearLocalWeightData } from "./calendarUtils";

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

export async function flushAllLocalToServer(userId) {
  if (!userId) return;

  const allData = {};
  const userKeys = getAllKeysForOwner(userId);

  for (const key of userKeys) {
    const monthKey = key.replace(`weights-${userId}-`, "");
    const value = localStorage.getItem(key);
    try {
      allData[monthKey] = JSON.parse(value);
    }
    catch {
      console.warn("[flushAllLocalToServer] Skipped invalid data for: ", key);
    }
  }

  if (Object.keys(allData).length === 0) {
    console.log("[flushAllLocalToServer] No local data to upload.");
    return;
  }

  try {
    await saveAllWeightData(allData);
    console.log("[flushAllLocalToServer] Full data sync complete.");
  }
  catch (err) {
    console.error("[flushAllLocalToServer] Failed to sync:", err);
  }
};

//Function to handle data migration 
let migrationProcess = false;               //Guard to ensure migration only runs once
export async function migrationHandler(setHasMigrated, userId) {
  if (migrationProcess) return;             //If true, skips the function
  migrationProcess = true;

  if (localStorage.getItem("wt_migrated") === "true" || localStorage.getItem("wt_migrated") === "skip") {
    console.log("[Migration] Already coompleted, skipping");
    return;
  }

  const ownerId = userId || "guest";

  //Check for guest (local) data if user just logged in (optional import):
  if (ownerId !== "guest") {
    const guestKeys = getAllKeysForOwner("guest");
    if (guestKeys.length > 0) {
      //const wantsImport = window.confirm("Found guest (logged-out) data from before login. Would you like to import it into your account?");

      //if (wantsImport) {
        for (const key of guestKeys) {
          const monthKey = key.replace("weights-guest-", "");
          const value = localStorage.getItem(key);

          if (value) {
            localStorage.setItem(`weights-${ownerId}-${monthKey}`, value);  //Attaches "userId" to the storageKey replacing "weights-guest-YYYY-mm" to "weights-userId-YYYY-mm"
          }
        }
      //  console.log(`[Migration] Imported guest data → user ${ownerId}`);
      //}
      //else {
      //  console.log("[Migration] Guest data skipped by user choice");
      //}
    }
  }

  //Collect all local weight entires for the current owner: (To replace all "weights-ownerId" entries to "yyyy-mm" format so it can be sent for migration)
  const ownerKeys = getAllKeysForOwner(ownerId);
  const localWeightData = {};
  for (const key of ownerKeys) {
    const monthKey = key.replace(`weights-${ownerId}-`, "");             //Look for keys like "weights-ownerId-yyyy-mm" & replace it with "yyyy-mm"
    const value = localStorage.getItem(key);                             
    try {
      localWeightData[monthKey] = JSON.parse(value);                     //Store the value of old key to the new key if its not empty
    }
    catch {
      console.error("Failed to parse local weight data for ", key);
    }
  }

  //Migration logic:
  if (!localStorage.getItem("wt_migrated")) {
    try {
      const serverData = await fetchAllWeightData() || {};
      const localData = localWeightData;
      let finalMergedData;

      const lastUserId = localStorage.getItem("lastLoggedInUserId");
      if (lastUserId === userId) {    //Skip migration prompts and auto merge if the last user logged back in again
        console.log("[Migration] Skipping Prompts: Merge done automatically since same user logged back in");
        finalMergedData = mergeWeightData(serverData, localData);
        const resMig = await migrateWeightToServer(finalMergedData);
        pasteToLocalStorage(ownerId, resMig.weightData);
      }
      else {                         //Trigger migration prompts if the last user and the current user is different
        console.log("[Migration] Triggering Prompts: since last user differs from current");
        //Normalize both objects before comparing:
        const normalizedServer = normalizeData(stripEmptyMonthKeys(serverData));
        const normalizedLocal = normalizeData(stripEmptyMonthKeys(localData));
        
        //Directly logs in the user without migration prompt if they're starting with a clean UI with no weight inputs
        if (Object.keys(normalizedLocal).length === 0) {
          console.log("[Migration] Skipping and directly loading the user data since the user logged in with empty UI");
          finalMergedData = serverData;
          const resMig = await migrateWeightToServer(finalMergedData);
          pasteToLocalStorage(ownerId, resMig.weightData);
          setHasMigrated(true);
          localStorage.setItem("wt_migrated", "true");
          return;
        }

        const compareData = JSON.stringify(normalizedServer) === JSON.stringify(normalizedLocal);
        if (compareData) {
          console.log("[Migration] Skipping: No differences found between local and server data");
          localStorage.setItem("wt_migrated", "skip");
          return;
        }

        const userInput = window.prompt(
          `New user session found.\n` +
          `We found differences between your local and server weight data.\n\n` +
          `Choose how to proceed:\n` +
          `1 → Use local data only (overwrite server)\n` +
          `2 → Use server data only (discard local changes)\n` +
          `3 → Merge both (local overwrites matching days) [default]\n` +
          `4 → Start with a clean slate (this will PERMANENTLY DELETE all existing data) \n\n` +
          `Enter 1, 2, 3 or 4:`
        );

        const choice = userInput?.trim() || "3";        //Fallback to merge (3/default) by default (trim used to clear out whitespaces for avoiding logical errors)
        switch (choice) {
          case "1":
            finalMergedData = localData;
            break;

          case "2":
            finalMergedData = serverData;
            break;

          case "4":
            clearLocalWeightData(ownerId);
            const resCleanSlate = await clearServerWeightData();
            pasteToLocalStorage(ownerId, resCleanSlate.data);

            setHasMigrated(true);
            localStorage.setItem("wt_migrated", "true");
            return;

          default :
            finalMergedData = mergeWeightData(serverData, localData);
            break;
        }

        const shouldOverwrite = (choice === "1" || choice === "2");         //Overwrite flag to pass to the backend, to make sure local/server fully replaces data post updation
        const resMig = await migrateWeightToServer(finalMergedData, shouldOverwrite);
        pasteToLocalStorage(ownerId, resMig.weightData);
      }

      setHasMigrated(true);
      localStorage.setItem("wt_migrated", "true");                        //Migration flag to avoid re-running after every login
    }
    catch (err) {
      console.error("Migration failed: ", err);
    }
    finally {
      migrationProcess = false;               //Only set it to false after completion
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

//Function to pass the migrated full weightData to localStorage for display (So the server values are still in the UI even if logged out before rendering those months)
const pasteToLocalStorage = (ownerId, weightData) => {
  const cleanWeightData = stripEmptyMonthKeys(weightData);

  if (Object.keys(cleanWeightData).length === 0) {
    const staleServerKeys = getAllKeysForOwner(ownerId);
    for (const key of staleServerKeys) {
      localStorage.removeItem(key);
    }

    const staleLocalKeys = getAllKeysForOwner("guest");
    for (const key of staleLocalKeys) {
      localStorage.removeItem(key);
    }
  }
  else {
    for (const [key, value] of Object.entries(cleanWeightData)) {
      localStorage.setItem(`weights-${ownerId}-${key}`, JSON.stringify(value));
    }
  }
};