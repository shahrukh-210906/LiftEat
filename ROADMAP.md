# LiftEat product roadmap

## Agreed direction
Minimal black, white and gray UI. Fixed desktop sidebar. Improve usability and reliability before adding more AI. Finish, verify, preview and push each task separately.

## Usability and reliability phase
1. Today screen and clearer navigation: current iteration. Prioritize training, meal logging and resuming an active workout. Keep existing URLs working.
2. Simplify workout and meal logging: routine-first Train screen; one meal entry point with recent/search/text/photo choices; favorite and repeat meals.
3. Autosave and recovery: retain drafts, prevent duplicate submissions, recover interrupted sessions, useful retry and loading states.
4. Progress screen: real strength, consistency and nutrition trends with date ranges. Add primary navigation only when functional.
5. Production foundation: error monitoring, backups with restore verification, rate limits, release checks and secure deployment configuration.
6. Real-user and mobile testing, accessibility, slow connections and complete journeys.

## Deferred AI and launch work — resume after the phase above
- Exercise form analysis with MediaPipe: video uploads, pose-quality checks, bounded supported exercises, measured movement feedback and clear limitations.
- Inline exercise swap: equipment availability, movement similarity, user constraints and active workout integration.
- Deploy and harden the Python vision service: resource limits, private authentication, temporary-upload cleanup and operational monitoring.
- Production deployment of frontend, Node API, database-connected jobs and Python service.
- Privacy: upload disclosure/consent, retention, export and account-data deletion.
- Launch polish: performance, metadata, app icon, share previews and promotion assets.

## Existing AI features
Structured workout drafts, progressive overload hints, text meal estimates, personalized chat and proactive insights are implemented. Photo meal review is implemented (f1f5a5d9); live provider success, quota behavior and end-to-end photo accuracy still require verification. Passing mocked tests and health checks do not establish production readiness.
