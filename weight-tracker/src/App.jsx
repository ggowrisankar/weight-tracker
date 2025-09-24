import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Calendar from './components/Calendar'

function App() {

  return (
    <div>
      {/*<h2>Weight Tracker</h2>*/}
      <Calendar />
    </div>
  );
}

export default App;