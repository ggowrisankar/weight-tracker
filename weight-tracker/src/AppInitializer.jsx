import React, { useState, useEffect, useCallback } from "react";
import LoadingScreen from "./components/LoadingScreen";
import App from "./App";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AppInitializer() {
  const [isInitializing, setIsInitializing] = useState(true);

  const PING_URL = `${API_BASE}/ping`;
  //const TIMEOUT_MS = 50000;               //Max wait time for the backend to wake up before loading the main app in offline mode

  //Function to ping the backend (useCallback ensures its not recreated on every render)
  const initialize = useCallback(async () => {
    setIsInitializing(true);

    //const controller = new AbortController();   //Controller to abort the fetch after a while (timeout)
    //const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);   //Performs abort after timeout

    try {
      const resp = await fetch(PING_URL, {
        method: "GET",
        //signal: controller.signal,      //enables aborting
        cache: "no-store"                 //ensures a fresh request
      });

      //clearTimeout(timeoutId);         //Clear timeout once a response is received

      if (resp.ok) {      
        const data = await resp.json();
        if (data?.status === "ok") {
          //Backend is awake ; load app normally
          setIsInitializing(false);
          return;
        }
      }

      //If ping response is not ok, treat as failure
      console.warn("Ping returned unexpected response. Continuing.");
      setIsInitializing(false);       //Loads App despite ping failure
    }
    catch (err) {
      //clearTimeout(timeoutId);
      console.warn("Ping failed. Continuing.");
      setIsInitializing(false);       //Loads App despite ping failure
    }
  }, []);

  //Run the initialization function exactly once when the component loads.
  useEffect(() => {
    initialize();
  }, [initialize]);

  //Show LoadingScreen while initializing
  if (isInitializing) {
    return <LoadingScreen message="Waking up server... Please wait" />;
  }

  //Load the main app whether the backend is ready or not
  return <App />;
}