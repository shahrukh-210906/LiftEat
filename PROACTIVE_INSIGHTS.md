# Proactive dashboard insights

## User experience

The dashboard automatically shows up to three next-step cards derived from completed workouts and logged meals. No prompt, Gemini request or AI credit is needed. Cards compare the last seven days of workouts with the preceding seven, summarize food logs over the past 24 hours, and offer links to routines or nutrition. Missing logs are described as missing data, never proof of skipped meals or inactivity outside the app.

A background job starts with the Express server and checks accounts every five minutes using a bounded cursor (batch size 50). The dashboard fetches snapshots on mount, each visible minute, and when the tab becomes visible. This is polling, not WebSocket or OS push notifications. A first visit can refresh a missing/stale snapshot immediately. Dismissed cards stay hidden for the UTC calendar day; they can reappear the next day. The footer shows when the data was computed.

## API

`GET /api/dashboard/insights` with the existing Firebase Bearer token returns:

```json
{"computed_at":"2026-09-06T12:00:00.000Z","refreshing":false,"cards":[{"id":"2026-09-06:week","title":"Your training week","body":"…","action":"Review workouts","href":"/workout"}]}
```

`POST /api/dashboard/insights/:id/dismiss` persists dismissal only in the authenticated user's snapshot. Unknown cards return 404. Both endpoints require authentication. No user ID is accepted from request input. Network failures retain the last displayed snapshot with a visible refresh warning.

## Database and jobs

InsightSnapshot adds one unique document per user: cards, computedAt, dismissed IDs, refreshingUntil lease and timestamps. WorkoutSession adds the `{user, is_active, completed_at}` compound index; DietLog adds `{user, logged_at}`. Create these indexes during deployment if autoIndex is disabled. No destructive migration is required.

Aggregation pipelines filter by the authenticated account before grouping completed workouts or summing logged nutrition. Active workouts and future-dated logs do not count. Nutrition uses a rolling 24-hour window, clearly labeled, rather than inferring a local timezone. Current daily protein goals are shown as a reference, not as a conclusion about the user's full intake. No calorie reduction or medical recommendations are generated.

A MongoDB lease prevents overlapping refreshes for an account across processes. Leases expire after 60 seconds following a crash. Computed snapshots are reused for five minutes. Job exceptions do not stop processing later accounts. Shutdown stops the timer and waits for the running cycle before disconnecting MongoDB. On serverless hosts, timers are not a reliable scheduler: deploy the backend as a persistent service or run this worker from a managed scheduled job. Frontend on-demand refresh still works.

## Deployment and validation

Restart the backend after deployment; no extra API keys or dependencies are required. Open `/dashboard` to preview. Server tests cover empty history, numerical summaries, privacy, dismiss persistence and refresh without any Gemini call. Component tests cover automatic retrieval, dismissal and honest error states. Existing chat, workout generation and meal estimation remain separate Gemini-dependent features.
