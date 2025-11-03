import React from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { AuthProvider } from './context/authContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Calendar from './components/Calendar';
import Login from './pages/login';
import Signup from './pages/signup';
import VerifyPage from './pages/verifyPage';

function App() {
  //BrowserRouter - Wraps the app and enables routing using browser history
  //Routes - Holds all the individual <Route> components
  //Route - Maps a URL path to a component
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Calendar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<VerifyPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;