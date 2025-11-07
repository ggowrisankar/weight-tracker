import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/authContext";               //Importing context
import useWeights from "../hooks/useWeights";
import useWeather from "../hooks/useWeather";
import { chunkIntoWeeks, calculateWeeklyAverage, calculateMonthlyAverage, hasMonthEnded } from "../utils/calendarUtils";
import { apiFetch } from "../api";
import { CalendarToolbar, CalendarHeader, SaveStatus, WeekdaysRow, CalendarGrid, MonthlyAverage } from "./CalendarComponents";  //Imports automatically from index.js
import "../styles/Calendar.css";

function Calendar () {
  const[today,setToday] = useState(new Date());
  const year = today.getFullYear();
  const month = today.getMonth();           //Getting month in index form
  const currentDate = new Date();
//  const[currentMonth, setCurrentMonth] = useState(month);
//  const[currentYear, setCurrentYear] = useState(year);
  const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  //Get number of days in the current month
  const daysInMonth = new Date(year, month+1, 0).getDate(); //Using day "0" of next month gives last day of current month
//  const daysInMonth = new Date(currentYear, currentMonth+1, 0).getDate();
  
  //Align first day of the month as Mon-Sun (default Sun-Sat)
  const firstDay = new Date(year, month, 1).getDay();   //Returns the first day of the month (Sun-Mon) as indices 0-6
//  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const firstDayofMonth =  (firstDay + 6) % 7;        //Converting to Mon-Sun as indices 0-6

  //Build days array (nulls = empty slots before day 1)
  const daysArray = [
    ...Array(firstDayofMonth).fill(null),                  //Empty slots until the first day
    ...Array.from({length:daysInMonth}, (_,i) => i+1)     //Creating an array starting from 1 to total no of days
  ];

  //Checking if each week has 7 days. If not, rest are filled with nulls(blanks)
  while (daysArray.length % 7 !== 0) {
    daysArray.push(null);
  } 

  // --- Custom hooks ---
  //useWeights hook (weights stored in localStorage):
  const { weights, handleWeightChange, errors, draft, handleInputValidation, loading, saveStatus, handleReset, flushPendingSaves } = useWeights(year, month);
  const [toggleWeather, setToggleWeather] = useState(false);                          //Weather icon is only displayed if toggled
  const weather = useWeather(year, month, toggleWeather);                             //useWeather hook (weather fetched + cached)

  //Get hooks from AuthProvider context:
  const { isAuthenticated, user, logout, hasMigrated, setHasMigrated } = useAuth();
  
  //Toggle icon for editing all days
  const [freeEditMode, setFreeEditMode] = useState(false);

  //Utility hooks for Email-Verification link:
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [showEmailTooltip, setShowEmailTooltip] = useState(false);

  const emailTooltipRef = useRef();
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emailTooltipRef.current && !emailTooltipRef.current.contains(e.target)) {
        setShowEmailTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /*//On mount, pass flushPendingSaves to registerFlushHandler so it can be used in AuthProvider for logout functions.
  useEffect(() => {
    if (flushPendingSaves) registerFlushHandler(flushPendingSaves);
  }, [flushPendingSaves]);                                       //Ensures only the latest version is registered 
  */

  /*//Force local saves and trigger migration logic on mount (Migration is only moved here so only the latest values (weights) are synced and consistent)
  useEffect(() => {
    const handleMigration = async () => {
      if (isAuthenticated && !hasMigrated) {
        console.log("[Migration] Starting migration...");
        await flushPendingSaves();                                             //Ensure any pending local saves are flushed                                  
        await migrationHandler(setHasMigrated, user?.id || "guest");           //Run migration logic
        console.log("[Migration] Migration completed");
      }
    };

    handleMigration();
  }, [isAuthenticated]);
*/

  //Previous & Next Month Navigation
/* function goToPreviousMonth() {
    if(currentMonth === 0) {
      setCurrentMonth(11);                  //December
      setCurrentYear(currentYear - 1);      //Previous year
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }
  function goToNextMonth() {
    if(currentMonth === 11) {
      setCurrentMonth(0);                   //January
      setCurrentYear(currentYear + 1);      //Next year
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }
*/

  async function goToPreviousMonth() {
    await flushPendingSaves();                //Added to force previous saves while navigating
    setToday(new Date(year, month - 1, 1));   //(year, month, day)
  }
  async function goToNextMonth() {
    await flushPendingSaves();
    setToday(new Date(year, month + 1, 1));
  }

  //Convert into weeks (using utils)
  const weeks = chunkIntoWeeks(daysArray);

  const monthlyAverage = calculateMonthlyAverage(daysArray, weights);

  async function handleResendVerification() {
    try {
      setSending(true);
      setMessage("");
      const res = await apiFetch("/auth/send-verification", { method: "POST" });
      if(res?.success) {
        setMessage("A verification link has been sent to your email");
      }
      else {
        setMessage(res?.message || "Something went wrong. Please try again.");
      }      
    } catch {
      setMessage("Failed to send verification link");
    }
    finally {
      setSending(false);
    }
  }

  return (
    <div className="calendar-container">
      <CalendarToolbar
        isAuthenticated={isAuthenticated}
        user={user}
        showEmailTooltip={showEmailTooltip}
        setShowEmailTooltip={setShowEmailTooltip}
        emailTooltipRef={emailTooltipRef}
        sending={sending}
        handleResendVerification={handleResendVerification}
        message={message}
        logout={logout}
        freeEditMode={freeEditMode}
        setFreeEditMode={setFreeEditMode}
        handleReset={handleReset}
        toggleWeather={toggleWeather}
        setToggleWeather={setToggleWeather}
      />

      {isAuthenticated && (
        <SaveStatus saveStatus={saveStatus} loading={loading} />
      )}

      <CalendarHeader
        month={month}
        year={year}
        monthName={monthName}
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
      />

      <WeekdaysRow weekDays={weekDays} />

      <CalendarGrid
        weeks={weeks}
        year={year}
        month={month}
        currentDate={currentDate}
        weights={weights}
        errors={errors}
        draft={draft}
        weather={weather}
        toggleWeather={toggleWeather}
        handleWeightChange={handleWeightChange}
        handleInputValidation={handleInputValidation}
        calculateWeeklyAverage={calculateWeeklyAverage}
        freeEditMode={freeEditMode}
      />

      <MonthlyAverage
        monthlyAverage={monthlyAverage}
        currentDate={currentDate}
        month={month}
        year={year}
        hasMonthEnded={hasMonthEnded}
      />
    </div>
  );

}

export default Calendar;