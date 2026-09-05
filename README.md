# LiftEat

Fitness tracker built with React/TypeScript, Express, MongoDB and optional local Ollama models.

## Run locally

Requires Node.js 22 or later, npm, and MongoDB. In `server`, run `npm ci`, copy `.env.example` to `.env`, set a long random `JWT_SECRET` and your `MONGO_URI`, then run `npm run dev`.

In a second terminal, open `client`, run `npm ci` and `npm run dev`. Open http://localhost:8080. The development server forwards `/api` to the backend on port 5000.

For exercise data, run `npm run seed` in `server`. The seed updates exercises by name and adds missing records while preserving existing IDs, notes, ratings and routine references.

AI chat and dashboard tips use the Gemini REST API. Set `GEMINI_API_KEY` in `server/.env`, optionally set `GEMINI_MODEL` (default `gemini-2.5-flash`), and restart the server. Never put the key in client environment variables. API reference: https://ai.google.dev/api/generate-content.

The coach reads only the authenticated account's profile, latest 30 workouts with actual sets/reps/weights, latest 100 food entries with macros, latest 40 chat messages, and all-time lifting summaries for up to 100 exercises. This context is rebuilt on each request, so new logs are immediately available. It is bounded memory, not unlimited recall. Relevant data is sent to Google Gemini; no passwords, tokens or other users' records are included. Chat turns persist in MongoDB. Clearing chat removes conversation history; workout and food records remain available to the coach. Chat suggestions do not automatically create food or workout records.

Body-image analysis still uses optional local Ollama with `OLLAMA_VISION_MODEL` (default `llama3.2-vision`). Core tracking works without AI; unavailable AI requests return a clear error. Image uploads accept JPEG, PNG and WebP up to 5 MB.

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
