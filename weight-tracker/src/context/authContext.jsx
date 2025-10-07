//Used to persist and manage user authentication state (logged in vs logged out) across the app — based on whether a valid token and user exist.
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();                  //Creates a context for authentication

//This component will wrap around parts of the app that need auth data.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);             //State to store user info
  const [loading, setLoading] = useState(true);       //State to indicate if app is still checking auth status

  useEffect(() => {
    const token = localStorage.getItem("wt_token");
    const userData = localStorage.getItem("wt_user");

    if (token && userData) {
      //try-catch used for handling the parsed data. Success > Update user state : Failure > Remove corrupted data.
      try {
        setUser(JSON.parse(userData));
      }
      catch (e) {
        console.error("Invalid stored user data: ", e);
        localStorage.removeItem("wt_token");
        localStorage.removeItem("wt_user");
      }
    }

    setLoading(false);                //Mark loading as complete
  }, []);

  //Function to log in to the user and store token and user data to localStorage.
  const login = (token, userData) => {
    localStorage.setItem("wt_token", token);
    localStorage.setItem("wt_user", JSON.stringify(userData));

    setUser(userData);                //Update user state
  };

  //Function to log out of the user and remove token and user data from localStorage.
  const logout = () => {
    localStorage.removeItem("wt_token");
    localStorage.removeItem("wt_user");

    setUser(null);                    //Clear user state
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