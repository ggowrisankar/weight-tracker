//Used to persist and manage user authentication state (logged in vs logged out) across the app — based on whether a valid token and user exist.
import React, { createContext, useContext, useState, useEffect } from "react";
import { isTokenValid, migrationHandler } from "../utils/contextUtils";

const AuthContext = createContext();                  //Creates a context for authentication

//This component will wrap around parts of the app that need auth data.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);                                   //State to store user info
  const [loading, setLoading] = useState(true);                             //State to indicate if app is still checking auth status
  const [tokenExpiryTimeout, setTokenExpiryTimeout] = useState(null);       //Stores timeout ID to allow clearing the auto-logout timer when needed
  const [hasMigrated, setHasMigrated] = useState(false);                    //Flag for checking if data migration has happened or not (used for rerending UI data if true)

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
  const login = (token, userData) => {
    if (tokenExpiryTimeout) clearTimeout(tokenExpiryTimeout);       //Clear any existing token expiry timeout to avoid multiple logout timers

    localStorage.setItem("wt_token", token);
    localStorage.setItem("wt_user", JSON.stringify(userData));

    setUser(userData);                //Update user state

    //Token expiry auto-logout logic:
    autoLogoutTimeout(token);

    //Data Migration Handler:
    migrationHandler(setHasMigrated);
  };

  //Function to log out of the user and remove token and user data from localStorage.
  const logout = () => {
    if (tokenExpiryTimeout) clearTimeout(tokenExpiryTimeout);   //Clear any existing token expiry timeout to avoid multiple logout timers

    localStorage.removeItem("wt_token");
    localStorage.removeItem("wt_user");

    localStorage.removeItem("wt_migrated");
    setHasMigrated(false);

    setUser(null);                              //Clear user state
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