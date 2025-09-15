# Weight Tracker + Weather App

A **React + Node/Express** project that combines **daily weight tracking** with **weather forecasts**.  
Users can log their weight for each day, view weekly and monthly averages, and see corresponding weather icons fetched from the OpenWeather API.

---

## Features

### Frontend (React)
- **Calendar UI**
  - Month navigation with previous/next buttons.
  - Weekly grid view (Mon–Sun) with an extra **Average** column.
  - Daily weight input (stored locally).
  - Displays **weekly** and **monthly averages**.

- **Weather Integration**
  - Weather data displayed with icons for only **current day and next** .
  - Fetching order:
    1. **Geolocation API** (browser location).
    2. **IP lookup** via `ipapi.co/json`.
    3. **Default fallback** city.

- **Data Persistence**
  - Weights stored in **localStorage**, scoped by year & month.
  - Weather data cached in **localStorage** to avoid redundant fetches.

---

### Backend (Node + Express)
- **API Proxy** for OpenWeather (hides API key from frontend).
- `/weather` route:
  - Accepts `?city=London` or `?lat=xx&lon=yy`.
  - Fetches weather data from OpenWeather API.
  - Transforms and returns simplified forecast (today/tomorrow at 21:00).
- Handles errors with proper status codes and consistent JSON responses.
- Uses **dotenv** for secure API key management.

---

## Project Structure

```
frontend/
 ├─ components/
 │   └─ Calendar.jsx
 ├─ hooks/
 │   ├─ useWeights.js
 │   └─ useWeather.js
 └─ utils/
     └─ calendarUtils.js

backend/
 ├─ server.js
 ├─ controllers/
 │   └─ weatherController.js
 ├─ routes/
 │   └─ weatherRoutes.js
 └─ services/
     └─ weatherService.js   # (fetches + transforms OpenWeather data)
```

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ggowrisankar/weight-tracker.git
cd weight-tracker
```

### 2. Install dependencies
- **Frontend**
  ```bash
  cd frontend
  npm install
  npm start
  ```
  Runs the React app at `http://localhost:5173` (or `3001` depending on setup).

- **Backend**
  ```bash
  cd backend
  npm install
  npm run dev
  ```
  Runs the Express server at `http://localhost:3000`.

---

## Environment Variables

Create a `.env` file in the **backend** folder:

```env
API_KEY = your_api_key_here
PORT = 3000
```

---

## Technologies

- **Frontend:** React (Hooks, localStorage)
- **Backend:** Node.js, Express
- **API:** OpenWeatherMap (forecast data), ipapi (IP-based fallback)
- **Other:** dotenv, CORS

---

## Future Improvements

- [ ] Replace inline styles with **Tailwind CSS** for cleaner UI.
- [ ] Add **user authentication** for persistent weight tracking across devices.
- [ ] Expand weather display (more days, details).
- [ ] Improve error handling and loading states on the frontend.

---

## Learning Notes

This project helped practice:
- Building custom React hooks (`useWeights`, `useWeather`).
- Using localStorage for **caching & persistence**.
- Calendar grid manipulation and average calculations.
- Proxying API requests through an **Express backend**.
- Managing sensitive API keys with dotenv.

---