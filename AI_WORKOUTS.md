# Structured workout generation (v1)

## Run and integrate

1. Put `GEMINI_API_KEY` and a structured-output-capable `GEMINI_MODEL` in the root `.env` (the tested local model is `gemini-flash-latest`). Restart the backend.
2. Populate the exercise library with `npm run seed` in `server` if it is empty.
3. Sign in and open `/routines`. Select focus, minutes and available equipment, then generate, review and save. Start the saved routine normally.

All requests use `Authorization: Bearer <Firebase ID token>`. The client supplies neither user IDs nor history. Gemini receives the account profile, latest five workouts, and a catalog of up to 120 matching exercises. Only matching catalog IDs can be returned.

## Endpoints

`POST /api/workouts/ai/generate`

```json
{"focus":"legs","duration_minutes":45,"equipment":["barbell","body weight"]}
```

Returns 201 with a MongoDB routine in `draft` status, populated exercises, rep/set/rest targets and AI rationale. Generation does not add it to the routine library. Errors: 400 invalid input, 409 empty catalog, 429 same user already generating on this process, 502 invalid/unavailable AI response, 503 missing key. Standard auth errors apply.

`POST /api/workouts/ai/:id/save` with an empty body publishes the caller's draft to their library. Retrying is idempotent (same routine ID). Cross-account IDs return 404. Removed exercises return 409. Drafts cannot start workouts. Ordinary routine creation remains unchanged.

## Schema and validation

The JSON Schema in `server/controllers/aiWorkoutController.js` is passed to Gemini as `responseJsonSchema` with `responseMimeType: application/json`. Independent server validation rejects additional/missing fields, duplicate or hallucinated exercise IDs, non-integer or out-of-range prescriptions, and excessive estimated duration. Time is conservatively estimated as 5 minutes warmup + 1 minute transition per exercise + sets × (reps × 4 seconds + rest). This is an estimate, not a guarantee.

WorkoutRoutine adds `status` (draft/ready), per-exercise `reps` and `rest_seconds`, and `ai` metadata (model, schema version, rationale, focus, duration). Existing documents without status still appear and start normally; no destructive migration is required. WorkoutExercise adds `target_reps` and `rest_seconds`, copied when starting a routine and displayed in the session UI. No suggested weight or automatic progressive overload is included in this iteration.

## Operational boundaries

Drafts persist until deleted through the existing owner-scoped routine deletion endpoint; no TTL deletes saved routines. The in-flight guard is process-local: multi-instance deployment needs shared rate limiting at the gateway and provider spending limits. No claim of medical clearance is made. Generation failures save no draft; users can retry. Model/context data and credentials are never logged. The workout list requires explicit user approval via Save.

## Verification

Server integration tests cover schema rejection, ownership, draft visibility/start restrictions, idempotent saving and prescription transfer. Component tests cover generate/review/save and visible failures. Gemini transport tests cover its request shape and response failures.

Provider reference: https://ai.google.dev/api/generate-content
