# Progressive overload suggestions (v1)

## Preview and API

Start a saved AI routine, then use **Check progression** under an exercise. Choose the smallest weight increment available on your equipment. **Use … kg × … reps** only fills the next set inputs; the user must still log the performed set.

`GET /api/workouts/exercises/:exerciseId/progression?increment=2.5`

Requires a Firebase Bearer token and an exercise belonging to the caller's active session. Returns version, decision (`increase`, `hold`, `insufficient_data`), nullable weight_kg and reps, increment_kg, reason, and the two source sessions' dates and sets. Returns 400 for invalid increments, 404 for unowned/missing exercise, 409 for finished sessions. Does not call Gemini or write to MongoDB.

## Policy

The MongoDB aggregation starts with owned completed sessions and joins exercise entries by exact exercise ID. It considers the latest two matching sessions, excluding the active session. Duplicate exercise entries in one session are treated as ambiguous. Both sessions must have exactly the current prescribed set count, completed sets at one consistent positive weight, and valid repetitions. Every set must exceed the current target by two reps before suggesting one equipment increment, capped at 5% of the prior load. Mixed loads, missing prescriptions, bodyweight and insufficient history require manual choice. Sessions older than 30 days do not produce a suggested load.

This is a conservative product heuristic inspired by the two-for-two progression concept, not a medical assessment or personalized clearance. Fatigue, pain, form, warm-up versus working sets, equipment differences and readiness are not captured by the existing data. The user must review the suggestion. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC11209834/

## Database and deployment

Uses existing `WorkoutSession` ownership/completion, `WorkoutExercise.exercise_base`, `target_sets`, `target_reps`, and logged `sets`. No destructive migration or new stored fields are required. It works immediately for AI-generated routines carrying set/rep targets. Legacy routines without rep targets return an explanatory no-suggestion result. Version 1 identifies the rules used. Restart the Express backend after deployment; the existing API proxy configuration is unchanged.

Tests cover increase/hold decisions, missing or stale history, mixed loads, ownership isolation, invalid inputs, and completed-session restrictions.
