import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppInitializer from './AppInitializer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppInitializer />
  </StrictMode>
);