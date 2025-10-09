//Used to persist and manage user authentication state (logged in vs logged out) across the app — based on whether a valid token and user exist.
import React, { createContext, useContext, useState, useEffect } from "react";
import { migrateWeightToServer } from "../utils/weightApi";

const AuthContext = createContext();                  //Creates a context for authentication

//This component will wrap around parts of the app that need auth data.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);                                   //State to store user info
  const [loading, setLoading] = useState(true);                             //State to indicate if app is still checking auth status
  const [tokenExpiryTimeout, setTokenExpiryTimeout] = useState(null);       //Holds a timeout ID to auto-logout the user when the JWT expires

  useEffect(() => {
    const token = localStorage.getItem("wt_token");
    const userData = localStorage.getItem("wt_user");

    if (token && userData && isTokenValid(token)) {
      //try-catch used for handling the parsed data. Success > Update user state : Failure > Remove corrupted data.
      try {
        setUser(JSON.parse(userData));
        autoLogoutTimeout(token);
      }
      catch (e) {
        console.error("Invalid stored user data: ", e);
        localStorage.removeItem("wt_token");
        localStorage.removeItem("wt_user");
        logout();
      }
    }
    else {
      logout();
    }

    setLoading(false);                //Mark loading as complete
  }, []);

  //Function to log in to the user and store token and user data to localStorage.
  const login = async (token, userData) => {
    if (tokenExpiryTimeout) clearTimeout(tokenExpiryTimeout);       //Clear any existing token expiry timeout to avoid multiple logout timers

    localStorage.setItem("wt_token", token);
    localStorage.setItem("wt_user", JSON.stringify(userData));

    setUser(userData);                //Update user state

    //Token expiry auto-logout logic
    autoLogoutTimeout(token);

    //Collect all local weight entires (To replace all "weights-" entries to "yyyy-mm" format so it can be sent for migration)
    const localWeightData = {};
    for (let i=0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key.startsWith("weights-")) {                         //Look for keys like "weights-yyyy-mm"
        const monthKey = key.replace("weights-", "");           //Replace keys to "yyyy-mm"
        const value = localStorage.getItem(key);

        try {
          localWeightData[monthKey] = JSON.parse(value);        //Store the value of old key to the new key
        }
        catch {
          console.error("Failed to parse local weight data for ", key);
        }
      }
    }

    if (Object.keys(localWeightData).length > 0 && !localStorage.getItem("wt_migrated")) {
      try {
        await migrateWeightToServer(localWeightData);
        console.log("Data Migration Successful");
        localStorage.setItem("wt_migrated", "true");            //Migration flag to avoid re-running after every login
      }
      catch (err) {
        console.error("Migration failed: ", err);
      }
    }
  };

  //Function to log out of the user and remove token and user data from localStorage.
  const logout = () => {
    if (tokenExpiryTimeout) clearTimeout(tokenExpiryTimeout);   //Clear any existing token expiry timeout to avoid multiple logout timers

    localStorage.removeItem("wt_token");
    localStorage.removeItem("wt_user");
    localStorage.removeItem("wt_migrated");

    setUser(null);                    //Clear user state
  };

  //Function to check if token is valid. (Returns boolean)
  const isTokenValid = (token) => {
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

  //Function to execute autoLogout after token expiry.
  const autoLogoutTimeout = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiry = payload.exp * 1000;                        //*1000 makes it in ms (expiry default is in seconds)
      const timeout = expiry - Date.now();                      //Subtracts to get the value in ms

      if (timeout > 0) {
        const timeoutId = setTimeout(() => logout(), timeout);
        setTokenExpiryTimeout(timeoutId);
      }
    }
    catch {
      console.error("Invalid token payload");
      logout();
    }
  };

  //Object containing auth-related values and functions to be shared.
  const value = {
    user,                             //Current user state
    isAuthenticated: !!user,          //Boolean indicating if user is logged in
    login,                            //Login function
    logout,                           //Logout function
    loading                           //Loading state to avoid premature rendering
  };

  //Provide the auth context to children components (Only render children when not loading).
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

//Custom hook for using the auth context more easily.
export const useAuth = () => useContext(AuthContext);