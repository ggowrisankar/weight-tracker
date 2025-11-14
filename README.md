# Keepr: Weight Tracker App

> Lightweight weight-tracking calendar with offline-first UX, user accounts, email verification, password reset and optional weather icons.

---

## Table of Contents
1. Project overview
2. Features
3. Tech stack
4. Repo layout
5. Quick start (local)
6. Environment variables
7. Development commands
8. Deployment
9. API summary
10. Contributing
11. Troubleshooting
12. License / usage
13. Future improvements / features

---

## 1. Project overview
Keepr is a small full-stack weight tracker that stores per-day weights in a compact monthly object. It supports:
- Local-first experience (localStorage) with background syncing
- User accounts (signup/login), JWT access + refresh tokens
- Server-side storage and migration of guest data on login
- Email verification and password reset flows
- Weather widget (uses OpenWeatherMap via a backend proxy + caching)
- Rate limiting on sensitive endpoints

This repo contains:
- `backend/` — Node.js + Express API (MongoDB)
- `weight-tracker/` — React + Vite frontend

---

## 2. Features
- Per-day weight entries in a intuitive calendar UI.
- Autosave with debounce and flush (when navigating months or logging out).
- User authentication and token auto-refresh.
- Migrate guest/local data into the user’s server profile on login.
- Reset server-side weight data for a user.
- Weather icons for current month (optional) via geolocation / IP fallback.
- Email verification (Brevo SMTP API) and Password Reset.

---

## 3. Tech stack
**Backend**
- Node.js (ES modules)
- Express 5
- Mongoose (MongoDB)
- bcrypt, jsonwebtoken
- node-fetch
- express-rate-limit

**Frontend**
- React + Vite
- React Router
- Custom hooks for weights & weather
- LocalStorage-based offline-first strategy

**Infrastructure**
- MongoDB Atlas (DB)
- Render (backend deployment)
- Vercel (frontend deployment)

---

## 4. Repo layout (high level)
```
/backend
  server.js
  package.json
  controllers/
    authController.js
    passwordResetController.js
    verificationController.js
    weightController.js
    weatherController.js
  routes/
    authRoutes.js
    weightRoutes.js
    weatherRoutes.js
  models/
    user.js
    weight.js
    weatherCache.js
  services/
    weatherService.js
  middleware/
    authMiddleware.js
  utils/
    sendEmail.js
    rateLimiters.js

/weight-tracker
  src/
    main.jsx
    App.jsx
    api.js
    components/
      CalendarComponents/...
      Calendar.jsx
    context/
      authContext.jsx
    hooks/
      useWeights.js
      useWeather.js
    pages/
      login.jsx
      signup.jsx
      forgotPassword.jsx
      resetPassword.jsx
      verifyPage.jsx
    utils/
      contextUtils.js
      calendarUtils.js
      userApi.js
      weightApi.js
      weatherUtils.js
  package.json (Vite)
  vercel.json
```

---

## 5. Quick start (local)
### Prerequisites
- Node.js 18+
- MongoDB URI (Atlas or local)
- SMTP/Brevo API key

### Backend
```
cd backend
cp .env.example .env
npm install
npm start
```

### Frontend
```
cd weight-tracker
npm install
npm run dev
```

---

## 6. Environment variables
**Backend**
```
PORT=3000 (dev ; No need to assign in prod)
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<jwt_access_secret>
JWT_REFRESH_SECRET=<jwt_refresh_secret>
EMAIL_VERIFY_SECRET=<email_verify_jwt_secret>
CLIENT_URL=http://localhost:5173 (dev)
API_KEY=<OPENWEATHER_API_KEY>
BREVO_API_KEY=<brevo_api_key>
SMTP_USER=<from_email_address>
```

**Frontend**
```
VITE_API_BASE_URL=http://localhost:3000 (dev)
```
When deploying:
- Frontend env MUST point VITE_API_BASE_URL to your backend Render URL.
- Backend env MUST include production CLIENT_URL (Vercel frontend), MongoDB URI, secrets and Brevo API key.

---

## 7. Development commands
**Backend**
- `npm start` – run server
- `npm run dev / nodemon server.js` – with nodemon

**Frontend**
- `npm run dev` – dev mode
- `npm run build` – production bundle

---

## 8. Deployment
Frontend → **Vercel** (set VITE_API_BASE_URL to your Render backend URL)  
Backend → **Render** (Node service; set environment variables in Render dashboard)  
DB → **MongoDB Atlas** (connection string in backend MONGO_URI)

Notes:
- Keep app.set('trust proxy', 1); for deployments behind proxies.
- Rate limiters rely on req.ip or x-forwarded-for header (proxy must forward client IP).
- Ensure `CLIENT_URL` points to production Vercel URL and `VITE_API_BASE_URL` to Render backend.

---

## 9. API summary
**Base:** `https://<backend-host>/`

**Auth:**
- `POST /auth/signup` — body `{ email, password }`
- `POST /auth/login` — body `{ email, password }` → returns `{ accessToken, refreshToken, user }`
- `POST /auth/refresh` — body `{ token }` → returns `{ accessToken }`
- `GET /auth/me` — requires `Authorization: Bearer <accessToken>` → returns current user

**Verification:**
- `POST /auth/send-verification` — requires auth → sends verification email
- `GET /auth/verify/:token` — verify token (GET route used in email link)

**Password Reset:**
- `POST /auth/request-password-reset` — body `{ email }` → sends reset link (if account exists)
- `POST /auth/reset-password/:token` — body `{ email, password }` → reset password

**Weights:**
- `GET /weights` — returns all months data (requires auth)
- `POST /weights` — body `{ weightData }` — replace all (requires auth)
- `GET /weights/:year/:month` — returns the month object `{ "1": 70.2, "2": 69.8 }`
- `POST /weights/:year/:month` — body `{ "1": 70.2, "2": 69.8 }` — save this month (requires auth)
- `POST /weights/migrate` — body `{ data: {...}, overwrite: boolean }` — merges/overwrites guest data into user
- `POST /weights/reset` — resets the user’s weight data to `{}`

**Weather:**
- `GET /weather?city=<name>` or `?lat=<>&lon=<>` — returns transformed forecast (today & tomorrow) cached in DB

---

## 10. Contributing
It’s primarily a solo project and I’ve only structured it to follow standard open-source practices.  
If you have suggestions or spot issues, feel free to open an issue or submit a pull request.

---

## 11. Troubleshooting
- **CORS errors:** ensure frontend origin is in backend allowedOrigins or change to allow your Vercel domain.
- **Token errors:** verify JWT_SECRET and JWT_REFRESH_SECRET match what frontend expects; tokens are signed with these secrets.
- **Email failures:** sendEMail uses Brevo API by default; add BREVO_API_KEY. For local testing, stub sendEMail to console.log.
- **Rate limits:** express-rate-limit applied globally and to verification/reset endpoints. If behind proxy, trust proxy must be set and forwarded IPs provided.

---

## 12. License / usage
This project is for learning/portfolio purposes. No formal license included by default.  
If you'd like to reuse or publish, consider adding an explicit license.

---

## 13. Future improvements / features
- Option to export/import data via csv/pdf (JSON download/upload).
- Manual streak map (so users can manually mark it to keep them motivated for being productive).
- Small check boxes/notes for each day for noting down productive activities.
- Graph view (a chart to indicate current weight progression and perhaps a predictive graph based on the current routine/trend, for side-by-side comparison).
- Trend indicators (e.g., arrows for weekly change up/down).
- User profile handling (for further securing of account/data if needed).
- Display "Quote of the day" for positive mental reinforcement.
