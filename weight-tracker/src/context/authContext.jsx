//Used to persist and manage user authentication state (logged in vs logged out) across the app — based on whether a valid token and user exist.
import React, { createContext, useContext, useState, useEffect } from "react";
import { isTokenValid, migrationHandler } from "../utils/contextUtils";
import { refreshAccessToken } from "../utils/userApi";

const AuthContext = createContext();                  //Creates a context for authentication

//This component will wrap around parts of the app that need auth data.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);                                   //State to store user info
  const [loading, setLoading] = useState(true);                             //State to indicate if app is still checking auth status
  const [tokenExpiryTimeout, setTokenExpiryTimeout] = useState(null);       //Stores timeout ID to allow clearing the auto-logout timer when needed
  const [hasMigrated, setHasMigrated] = useState(false);                    //Flag for checking if data migration has happened or not (used for rerending UI data if true)

  useEffect(() => {
    const accessToken = localStorage.getItem("wt_token");
    const refreshToken = localStorage.getItem("wt_refresh");
    const userData = localStorage.getItem("wt_user");

    async function restoreSession() {
      if (!refreshToken && !userData) {
        logout();
        setLoading(false);
        return;
      }

      try {
        let validToken = accessToken;

        //If access token expired but refresh exists, try refreshing.
        if (!isTokenValid(accessToken) && refreshToken) {
          const refreshed = await refreshAccessToken(refreshToken, logout);
          if (refreshed?.accessToken) {
            validToken = refreshed?.accessToken;
            localStorage.setItem("wt_token", validToken);
            console.log("Session restored with new token");
          }
          else {
            console.log("Refresh failed on startup");
            logout();
            setLoading(false);
            return;
          }
        }

        //Restore user and start timer
        setUser(JSON.parse(userData));
        autoLogoutTimeout(validToken, refreshToken);
      }
      catch (e) {
        console.error("Invalid stored user data:", e);
        localStorage.removeItem("wt_token");
        localStorage.removeItem("wt_refresh");
        localStorage.removeItem("wt_user");
        logout();
      }
      finally {
        setLoading(false);
      }
    }
    /*
    if (accessToken && refreshToken && userData && isTokenValid(accessToken)) {
      //try-catch used for handling the parsed data. Success > Update user state : Failure > Remove corrupted data.
      try {
        setUser(JSON.parse(userData));
        autoLogoutTimeout(accessToken, refreshToken);
      }
      catch (e) {
        console.error("Invalid stored user data: ", e);
        localStorage.removeItem("wt_token");
        localStorage.removeItem("wt_refresh");
        localStorage.removeItem("wt_user");
        logout();
      }
    }
    else {
      logout();
    }

    setLoading(false);                //Mark loading as complete
    */
    restoreSession();
  }, []);

  //Function to log in to the user and store token and user data to localStorage.
  const login = (accessToken, refreshToken, userData) => {
    if (tokenExpiryTimeout) clearTimeout(tokenExpiryTimeout);       //Clear any existing token expiry timeout to avoid multiple logout timers

    localStorage.setItem("wt_token", accessToken);
    localStorage.setItem("wt_refresh", refreshToken);
    localStorage.setItem("wt_user", JSON.stringify(userData));

    setUser(userData);                //Update user state

    //Token expiry auto-logout logic:
    autoLogoutTimeout(accessToken, refreshToken);

    //Data Migration Handler:
    migrationHandler(setHasMigrated);
  };

  //Function to log out of the user and remove token and user data from localStorage.
  const logout = () => {
    if (tokenExpiryTimeout) clearTimeout(tokenExpiryTimeout);   //Clear any existing token expiry timeout to avoid multiple logout timers

    localStorage.removeItem("wt_token");
    localStorage.removeItem("wt_refresh");
    localStorage.removeItem("wt_user");

    //Skip migrated flags in production since you dont want migration to perform after every login
    localStorage.removeItem("wt_migrated");
    setHasMigrated(false);

    setUser(null);                              //Clear user state
    console.log("[Auth] User logged out, storage cleared");
  };

  //Function to execute autoLogout after token expiry.
  const autoLogoutTimeout = (accessToken, refreshToken) => {
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));  //atob decodes Base64-encoded payload
      const expiry = payload.exp * 1000;                            //*1000 makes it in ms (expiry default is in seconds)
      const timeout = Math.max(expiry - Date.now() - 30000, 0);     //Subtracts to get the value in ms - Calls 30s early to trigger refresh token logic (Avoiding -ve values)
      
      console.log(`[Token Timer] Access token expires at: ${new Date(expiry).toLocaleTimeString()}`);
      console.log(`[Token Timer] Refresh scheduled to trigger in ${(timeout / 1000).toFixed(1)}s`);

      if (timeout > 0) {
        const timeoutId = setTimeout(async() => {
          console.log("[Token Refresh] Attempting to refresh access token...");
          const newToken = await refreshAccessToken(refreshToken, logout);
          if (newToken?.accessToken) {
            console.log("[Token Refresh] New access token received");
            localStorage.setItem("wt_token", newToken.accessToken);
            autoLogoutTimeout(newToken.accessToken, refreshToken);
          }
          else {
            console.log("[Token Refresh] Refresh failed... logging out");
            logout();
          }
        }, timeout);

        setTokenExpiryTimeout(timeoutId);
      }
    }
    catch (err) {
      console.error("[Token Timer] Invalid token payload: ", err);
      logout();
    }
  };

  //Object containing auth-related values and functions to be shared.
  const value = {
    user,                             //Current user state
    isAuthenticated: !!user,          //Boolean indicating if user is logged in
    login,                            //Login function
    logout,                           //Logout function
    loading,                          //Loading state to avoid premature rendering
    hasMigrated                       //Migration check state
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