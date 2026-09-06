# Meal photo analysis

LiftEat now accepts a meal photo on the Nutrition page and turns it into a reviewable nutrition draft. The browser sends the image to the authenticated Node API. Node validates the account, MIME type, file size and image signature, then forwards the image to the private FastAPI service. FastAPI verifies and resizes the image before sending it to Gemini with a strict JSON response schema.

Nothing is logged automatically. The user can change detected food names, portions and macros, remove incorrect items, choose a meal type, and explicitly confirm. Confirming uses the existing idempotent meal-draft endpoint and records the source as `ai_photo`. Images remain in memory during analysis and are not stored by LiftEat.

## Local setup

Set `VISION_SERVICE_URL=http://127.0.0.1:8000` and a long random `VISION_SERVICE_TOKEN` in the root `.env`. The same root file is read by Node and FastAPI. `GEMINI_API_KEY` and the optional `GEMINI_MODEL` are reused.

From `vision-service`, create a virtual environment, install `requirements.txt`, then run:

```text
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The health endpoint is `GET /health`. The analysis endpoint is private and requires `x-service-token`. Uploads accept JPEG, PNG and WebP up to 5 MB. FastAPI normalizes the image to JPEG and limits it to 1600×1600 before inference.

## Production

Deploy `vision-service` from its Dockerfile on a container host. Set `GEMINI_API_KEY`, `GEMINI_MODEL` and `VISION_SERVICE_TOKEN` there. Set the Node server's `VISION_SERVICE_URL` to the private service URL and use the same token. Do not expose the FastAPI service directly to the browser.
