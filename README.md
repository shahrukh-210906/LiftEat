# LiftEat

Fitness tracker built with React/TypeScript, Express, MongoDB and optional local Ollama models.

## Run locally

Requires Node.js 22 or later, npm, MongoDB, and a Firebase project with Email/Password authentication enabled. Edit only `.env` in the project root (beside this README). Your current settings have been consolidated there. For a fresh checkout, copy the root `.env.example` to `.env`. In `server`, run `npm ci` and configure `MONGODB_URI`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` from your service account. Use the entire private key, including PEM headers, quoted with escaped newlines. Run `npm run dev`. `MONGO_URI` remains supported as an alias.

In the same root `.env`, set the `VITE_FIREBASE_*` web app values from the same project. Only `VITE_` settings are exposed to the browser; keep server secrets unprefixed. In `client`, Authorize localhost in Firebase Authentication settings. Run `npm ci` and `npm run dev`. Open http://localhost:8080. The development server forwards `/api` to the backend on port 5000. Restart Vite after changing environment values.

Firebase ID tokens are refreshed by the client and verified by Firebase Admin on the server. Each Firebase UID maps to a MongoDB account so profiles, workouts, food logs and chat keep using isolated account IDs. An existing legacy account can be linked by matching email only after Firebase verifies that email; conflicting linked accounts are rejected. Legacy password endpoints are disabled when Firebase is configured. Environment files and service-account keys must stay local.

For signup to work, open Firebase Console → Authentication → Get started, enable Email/Password, and save. Copy service-account JSON values into the root `.env` without the trailing JSON commas. The private key must retain its PEM header/footer and newline escapes. Keep API keys in `.env`, never `.env.example`. Start both servers before signing up at http://localhost:8080/auth. Demo accounts use the same Firebase signup and MongoDB profile flow as regular accounts; their credentials are not stored in the repository.

For exercise data, run `npm run seed` in `server`. The seed updates exercises by name and adds missing records while preserving existing IDs, notes, ratings and routine references.

AI chat and dashboard tips use the Gemini REST API. Set `GEMINI_API_KEY` in the root `.env`, optionally set `GEMINI_MODEL` (default `gemini-2.5-flash`), and restart the server. Never put the key in client environment variables. API reference: https://ai.google.dev/api/generate-content.

The coach reads only the authenticated account's profile, latest 30 workouts with actual sets/reps/weights, latest 100 food entries with macros, latest 40 chat messages, and all-time lifting summaries for up to 100 exercises. This context is rebuilt on each request, so new logs are immediately available. It is bounded memory, not unlimited recall. Relevant data is sent to Google Gemini; no passwords, tokens or other users' records are included. Chat turns persist in MongoDB. Clearing chat removes conversation history; workout and food records remain available to the coach. Chat suggestions do not automatically create food or workout records.

Body-image analysis still uses optional local Ollama with `OLLAMA_VISION_MODEL` (default `llama3.2-vision`). Core tracking works without AI; unavailable AI requests return a clear error. Image uploads accept JPEG, PNG and WebP up to 5 MB.

Meal photo analysis uses the private FastAPI app in `vision-service`. Configure `VISION_SERVICE_URL` and `VISION_SERVICE_TOKEN` in the root `.env`, install `vision-service/requirements.txt`, and run Uvicorn on port 8000. The Node API authenticates users and forwards uploads; the browser never receives the Gemini key or service token. See `MEAL_PHOTO_ANALYSIS.md` for the full flow and deployment steps.

## Production operations

The API exposes `GET /api/health`, applies security headers and rate limits, and can report server errors to Sentry when `SENTRY_DSN` is configured. Set `TRUST_PROXY=true` when the API runs behind a trusted single proxy. `CLIENT_ORIGIN` accepts a comma-separated list of allowed frontend origins.

Database backups are disabled by default. In production, prefer the managed backup and point-in-time recovery offered by your MongoDB provider. For a long-running server with MongoDB Database Tools and durable storage, set `BACKUP_ENABLED=true` and `BACKUP_DIR` to a persistent directory. The app keeps the latest seven verified archives. Uploaded meal and physique images are processed in memory and are not stored by LiftEat; expired AI meal-review records are also removed daily.

## Checks

- Client: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Server: `npm test`. Integration tests launch a disposable MongoDB database and never use `MONGO_URI`. The first run downloads a MongoDB test binary and requires internet access.

Production builds enforce TypeScript checks. The client uses a same-origin `/api` by default; set `VITE_API_URL` at build time for a separate backend. Configure the web host to serve `index.html` for client-side routes, proxy `/api` when using the same origin, and set `CLIENT_ORIGIN` on the backend. Start the backend with `npm start`.

Tokens expire after seven days. Accounts with tokens from the earlier non-expiring implementation must sign in again.

## Layout

- `client/src/pages`: app screens.
- `client/src/hooks`: API and screen state.
- `server/routes`: authenticated endpoints.
- `server/models`: persisted records.
- `server/test`: API and account-isolation regressions.
