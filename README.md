# LiftEat

Fitness tracker built with React/TypeScript, Express, MongoDB and optional local Ollama models.

## Run locally

Requires Node.js 22 or later, npm, and MongoDB. In `server`, run `npm ci`, copy `.env.example` to `.env`, set a long random `JWT_SECRET` and your `MONGO_URI`, then run `npm run dev`.

In a second terminal, open `client`, run `npm ci` and `npm run dev`. Open http://localhost:8080. The development server forwards `/api` to the backend on port 5000.

For exercise data, run `npm run seed` in `server`. The seed updates exercises by name and adds missing records while preserving existing IDs, notes, ratings and routine references.

AI is optional. Start Ollama and install the models configured by `OLLAMA_CHAT_MODEL` and `OLLAMA_VISION_MODEL` (defaults: `llama3.1` and `llama3.2-vision`). Core tracking works without AI; unavailable AI requests return a clear error. Image uploads accept JPEG, PNG and WebP up to 5 MB.

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
