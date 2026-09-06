# Meal logging from text (v1)

## Use it

Open `/diet`, enter a description such as "Two boiled eggs, 150 g cooked rice and a banana", and choose **Estimate meal**. Review all foods, portion assumptions and macros. Changing grams scales that item's totals; all values can be corrected individually. Choose a meal type and confirm. One combined meal appears in today's log and updates dashboard totals.

These are model estimates, not measured or database-verified nutrition. Missing portions and preparation details can materially change the result. Nothing is logged without confirmation. Editing the original description clears the previous estimate.

## API integration

Use the existing Firebase ID token as a Bearer authorization header. Gemini configuration remains in the root `.env`; no new service or credentials are needed.

`POST /api/diet/estimate`

```json
{"text":"Two boiled eggs and 150 g cooked rice"}
```

Returns 201 with `id`, `items`, `assumptions`, `expires_at`, `estimated: true`. Each item contains exactly `name`, `quantity_g`, `calories`, `protein`, `carbs`, `fat`; nutrition is TOTAL for that portion. Input is limited to 2000 characters and output to 12 foods. Non-food descriptions return 422, invalid estimates return 502, missing key returns 503, overlapping estimates on one process return 429. Invalid input returns 400.

`POST /api/diet/estimate/:id/save`

```json
{"items":[{"name":"Cooked rice","quantity_g":150,"calories":195,"protein":4,"carbs":42,"fat":0.5}],"meal_type":"lunch"}
```

Returns the saved DietLog. Items can be corrected or removed before confirmation. Meal type is breakfast, lunch, dinner, or snack. An owned draft is required; missing/expired/unowned IDs return 404. Drafts expire after 24 hours. Retries return the same log, even with changed payload: the first successful save wins. Retrying a deleted saved meal returns 410 while its draft exists. A new estimate represents a new meal.

## Database changes

`MealDraft`: user ownership, embedded estimated items, assumptions, optional savedLog, expiresAt with TTL index. Raw descriptions are sent to Gemini but not stored. `DietLog`: optional unique sparse `mealDraft` reference, `source` (manual/ai_estimate), and embedded reviewed items. Existing top-level totals remain compatible with dashboard and coach queries. New meals are saved as one document, avoiding partial multi-food writes. No destructive migration is required. Ensure Mongoose indexes are built before enabling traffic; if autoIndex is disabled in production, create the unique sparse DietLog.mealDraft index and MealDraft.expiresAt TTL index during deployment.

## Validation and limits

Gemini receives a strict JSON schema; the server independently rejects missing/extra fields, negative/non-finite values, implausible mass or energy bounds, excessive portions, and malformed outputs. Review-time edits receive the same validation. The unique draft index protects against concurrent duplicate saves. The in-flight guard is process-local; shared gateway rate limiting is required for multi-instance deployment. No automatic background logging, vision or nutrient database lookup is included in this iteration.

## Checks

Integration tests cover confirmation, account isolation, corrected values, concurrent retries, deleted meals, non-food input and invalid model output. Component tests cover portion scaling, explicit save and failure states. Run server `npm test` and client `npm run build`, `npm run lint`, `npm test`.
