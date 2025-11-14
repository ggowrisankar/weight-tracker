# Keepr: Weight Tracker App — Documentation

> Developer-oriented deep-dive: architecture, API reference, data models, client flows and internals.

---

## Table of Contents
1. System architecture overview
2. Data models
3. Backend: routes & controllers (detailed)
4. Auth & security
5. Rate limiting & email
6. Weather service & caching
7. Frontend architecture & key components
8. Hooks and flows (deep dive)
9. Migration logic (client-side)
10. Debugging & common issues
11. Suggested improvements & TODOs
12. Appendix: example requests

---

## 1. System architecture overview
Keepr is a straightforward client-server app:
- **Frontend (Vite + React)** — calendar UI, localStorage persistence, authentication UI, migration flows, hooks for data and weather.
- **Backend (Node + Express)** — REST API handling authentication, weights, weather proxying to OpenWeather, email sending using Brevo SMTP API, rate limiters and MongoDB for persistence.
- **Database (MongoDB Atlas)** — stores `User`, `Weight`, and `weatherCache` collections.

Primary flow highlights:
- Guest users store per-month weight objects in `localStorage`.
- On login, the client runs migration logic (calls `/weights/migrate`) to merge/overwrite local guest data into server-side document.
- Autosave: frontend saves to localStorage always; if authenticated, it debounces server sync (1.5s); there’s a flush function to force immediate save on navigation or logout.

---

## 2. Data models
#### `User` (collection: `users`)

Fields (from `models/user.js`):
```
{
  _id,
  email: String (unique),
  passwordHash: String,
  createdAt: Date,
  isVerified: Boolean,
  resetPasswordToken: String (hashed),
  resetPasswordExpires: Date
}
```

Methods:
- `createPasswordResetToken()` — 32-byte random token returned raw; hashed value stored in `resetPasswordToken`, with expiry 10 minutes.

#### `Weight` (collection: `weights`)

Fields:
```
{
  userId: ObjectId (ref User), // unique
  weightData: Mixed // object mapping "YYYY-mm" => { "1": 70, "2": 69.5, ... }
}
```
Notes:
- `weightData` is stored as a mixed type (object) — the app relies on  
`weightData["2025-09"] = { "1": 72 }` format.

#### weatherCache
Fields:
```
{
  city: String (lowercased, indexed),
  data: Mixed (transformed object for frontend use),
  timestamp: Date
}
```
TTL index: documents auto-expire after 6 hours (`expireAfterSeconds` set to 6 * 60 * 60).

---

## 3. Backend: routes & controllers (detailed)
#### `/auth`

- `POST /signup` (authController.postSignUp)
  - body: `{ email, password }`
  - flow: validate → hash password → create user
  - responses:
    - `201` success
    - `400/401` validation/existing user

- `POST /login` (authController.postLogin)
  - body: `{ email, password }`
  - flow: verify user → bcrypt.compare → issue `accessToken` (1h) and `refreshToken` (7d)
  - response: `{ accessToken, refreshToken, user }`

- `POST /refresh`
  - body: `{ token }` (refresh token)
  - flow: verify refresh via `JWT_REFRESH_SECRET`, issue new access token

- `GET /me`
  - requires `Authorization` header
  - returns latest user object

#### `/auth/send-verification` & `/auth/verify/:token` (verificationController)

- `POST /send-verification` (auth required)
  - signs jwt `EMAIL_VERIFY_SECRET` `{ id, type: "email_verify" }` expires 24h
  - constructs `CLIENT_URL/verify?token=<jwt>`
  - calls `sendEMail`

- `GET /verify/:token`
  - verifies token, sets `user.isVerified = true`

#### `/auth/request-password-reset` & `/auth/reset-password/:token` (passwordResetController)

- `request-password-reset:` accepts `{ email }`
  - if account exists: calls `user.createPasswordResetToken()`, `sendEMail` with link containing token & email
  - ALWAYS responds with 200 success message (prevents enumeration)

- `reset-password/:token:`
  - expects `{ email, password }` in body and `:token` param
  - finds user by email + hashed token + expiry check
  - if valid: replace passwordHash & remove token/expiry

#### `/weights`

- `GET /weights` — returns all weightData object for user
- `POST /weights` — body `{ weightData }` replaces user's entire `weightData`
- `GET /weights/:year/:month` — returns object for that month (or `{}` if none)
- `POST /weights/:year/:month` — body: month object → upsert into `weightData[dataKey]`
- `POST /weights/migrate` — body `{ data: {...}, overwrite }`
  - if no doc exist: creates one with provided data
  - if `overwrite` true: clears server months before merging
  - otherwise merges month-by-month (local values overwrite server for same days)
- `POST /weights/reset` — sets `weightData = {}`

#### `/weather`
- `GET /weather?city=...` or `?lat=..&lon=..`
  - `fetchWeatherData` calls OpenWeather API using `API_KEY` env var
  - `transformWeatherData` picks 21:00 entries for “today” and “tomorrow” and returns a tiny object `{ <dayNumber>: { description, icon } }`
  - response is cached into `weatherCache` collection (TTL 6 hours)

---

## 4. Auth & security
- Passwords are stored as bcrypt hashes `(bcrypt.hash(password, 10))`.
- Access tokens: `JWT_SECRET`, expires in `1h`.
- Refresh tokens: `JWT_REFRESH_SECRET`, expires in `7d`.
- `authMiddleware` expects header: `Authorization: Bearer <accessToken>`.
- `authMiddleware` sets `req.user = { id, email }`.
- On token refresh, client stores new access token and schedules next refresh via decoded `exp`.
- Email verification uses a separate `EMAIL_VERIFY_SECRET`.
- Rate limiters guard verification and reset endpoints to prevent abuse.

---

## 5. Rate limiting & email
`backend/utils/rateLimiters.js:`
- `globalLimiter`: 100 requests/min per IP
- `verificationLimiter`: 3 requests / 10 min (with custom key generator using `x-forwarded-for`)
- `resetPasswordLimiter`: 5 requests / 10 min
- Handlers log `req.ip` and return JSON 429 on limit hit

`backend/utils/sendEmail.js:`
- Uses Brevo SMTP API as configured — `BREVO_API_KEY` and `SMTP_USER` are required
- Implementation uses `node`-fetch to call Brevo endpoint
- If Brevo fails locally, you can stub this function to `console.log` for dev

---

## 6. Weather service & caching
- Backend acts as proxy to OpenWeather to keep API keys server-side.
- `transformWeatherData` chooses the 21:00 forecast items for today and tomorrow, and constructs minimal `{ dayNumber: {description, icon} }` objects for frontend.
- Caching: `weatherCache` saves transformed data keyed by `city` and auto-expires after 6 hours (TTL index).

---

## 7. Frontend architecture & key components
Main files:
- `src/App.jsx` — routing & `AuthProvider`
- `src/main.jsx` — bootstraps React
- `src/api.js` — central `apiFetch(url, options, requireAuth=true)` using `VITE_API_BASE_URL` and reading `wt_token` from localStorage
- `context/authContext.jsx` — authentication state, `login`, `logout`, token auto-refresh and migration triggers
- `hooks/useWeights.js` — localStorage + server sync logic (debounce + flush)
- `hooks/useWeather.js` — toggled weather fetch with geolocation → IP → default city fallback
- `components/Calendar*` — primary UI components: toolbar, grid, day cell, averages

Key UI behavior:
- Calendar is month-based; the app computes `daysArray`, chunks into weeks and renders cells.
- Editing: only `today` or when `freeEditMode` enabled. Inputs validate numeric weight between 30–300 kg.
- Save lifecycle:
  - Local save (localStorage) immediate
  - Server save debounced (1.5s) for authenticated users
  - `flushPendingSaves()` forces immediate save (used when navigating months or logging out)
- `authContext.login` triggers `migrationHandler` to run `/weights/migrate` before exposing user state.

---

## 8. Hooks and flows (deep dive)
#### `useWeights(year, month)`
- `storageKey = storageKeyFor(ownerId, year, month+1)` where ownerId is `'guest'` or `user.id`
- Initial read from `localStorage[storageKey]`
- If authenticated and `hasMigrated` is true, it fetches server data and overwrites localStorage
- `weights` state persists to localStorage whenever it changes
- For authenticated users, a debounce timer waits 1.5s then calls `saveWeightData(year, month+1, weights)`
- `flushPendingSaves` cancels debounce and calls `saveWeightData` immediately
- `handleInputValidation` validates range 30–300 and toggles `isDirty` and `saveStatus`

#### `authContext`
- On mount, reads tokens & user from localStorage
- If access token invalid and refresh token exists → calls `refreshAccessToken`
- Sets `autoLogoutTimeout` using token `exp` payload — schedules a refresh 30s before expiry
- `login` saves tokens + runs `migrationHandler(setHasMigrated, user.id)` and then sets `user` in state
- `logout` flushes local data to server, converts user keys to` weights-guest-YYYY-mm` fallback keys and clears user keys, removes tokens and user

## 9. Migration logic (client-side)
- Local storage keys for weights use format `weights-<ownerId>-YYYY-mm`
- On logout, keys for last user are transformed into `weights-guest-YYYY-mm` so the guest can still see data
- On login, `migrationHandler` merges guest data into server by calling `/weights/migrate` with `overwrite` parameter when requested

---

## 10. Debugging & common issues
- **401 No token provided:** confirm `Authorization` header is set by `apiFetch` and `wt_token` exists in localStorage
- **Invalid Token:** ensure `JWT_SECRET` is identical across all running servers; in dev, rotating secret will invalidate tokens
- **CORS blocked:** update `backend/server.js` `allowedOrigins` array or use environment-based whitelist
- **Email not sending:** verify `BREVO_API_KEY` and sender email `SMTP_USER` are correctly set. For testing, stub `sendEMail` to print the message.
- **Weather returns empty:** OpenWeather keys or rate limits; backend maps `21:00:00` entries — if OpenWeather changes structure, the transform may need adjustment
- **Rate limit blocking in dev:** lower rate limit settings for local development or remove `globalLimiter` temporarily

---

## 11. Suggested improvements & TODOs
- Add unit & integration tests (Jest for backend, React testing library for frontend).
- SignUp immediately logs in the user.
- Absolute expiry and rotating tokens.
- Tokens to be stored in HttpOnly cookies.
- Enable TLS and enforce HTTPS in production.
- Add pagination/size limits to weight endpoints if data grows large.
- Add more structured logging (winston / pino) and error tracking (Sentry).
- Provide localization support for date formatting and number display.
- Improve password strength enforcement and add email templating with HTML templates.
- Create an API for displaying "Quote of the day" in the UI (using POSTMAN/FastAPI/Express).

---

## 12. Appendix: example requests

> Replace `<API_BASE>` with your backend URL (e.g., `http://localhost:3000` or deployed Render url)

#### Signup
```
curl -X POST "<API_BASE>/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"secret123"}'
```

#### Login
```
curl -X POST "<API_BASE>/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"secret123"}'
# Response returns { accessToken, refreshToken, user }
```

#### Fetch month weights (authenticated)
```
curl "<API_BASE>/weights/2025/9" \
  -H "Authorization: Bearer <accessToken>"
```

#### Save single month
```
curl -X POST "<API_BASE>/weights/2025/9" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"1": 72.0, "2": 71.5}'
```

#### Migrate guest data (client should call on login)
```
curl -X POST "<API_BASE>/weights/migrate" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"data": {"2025-09": {"1": 72}}, "overwrite": false }'
```

#### Request password reset
```
curl -X POST "<API_BASE>/auth/request-password-reset" \
  -H "Content-Type: application/json" \
  -d '{"email": "me@example.com"}'
```
