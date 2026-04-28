# Election Copilot AI

Election Copilot AI is an AI-assisted civic learning platform that explains the election process with structured answers, visible trusted sources, adaptive learning recommendations, quizzes, scenario support, and persistent learner progress.

This repository is intentionally built like a production-ready submission instead of a hackathon demo. The frontend is a Next.js App Router application, the backend is a FastAPI service, and the experience is designed to stay useful even when the live model is unavailable.

## Why This Project Stands Out

- Grounded AI with visible sources: every core answer can show direct guidance, explanation, and trusted public references.
- Adaptive learning system: quiz performance changes the next recommendation, revision path, and advanced-topic unlocks.
- Resilient fallback architecture: when live AI is unavailable, the product still delivers structured guidance instead of failing.
- Observability and production readiness: request IDs, JSON logs, auth, rate limiting, and structured error handling are already in place.
- Full testing coverage: backend tests, frontend unit tests, production build checks, and Playwright E2E all run successfully.

## Product Screens

Use these placeholders when preparing judge-facing screenshots:

| Screen | Placeholder |
| --- | --- |
| Dashboard | Add screenshot: adaptive path, score cards, and leaderboard |
| Chat | Add screenshot: direct answer, explanation, and visible sources |
| Quiz | Add screenshot: answer feedback and adaptive recommendation |
| Timeline | Add screenshot: step progression and selected-step detail |
| Scenario flow | Add screenshot: scenario selection to chat handoff |

## Architecture

```text
Browser
  -> Next.js App Router UI
  -> Local state, resilient fallbacks, adaptive rendering
  -> Authenticated API calls to FastAPI

Next.js frontend
  -> components/views/* for dashboard, timeline, chat, quiz, scenarios
  -> hooks/useChat.ts for sourced assistant responses + fallback
  -> hooks/useQuiz.ts for quiz generation + scoring
  -> hooks/useProgress.ts for adaptive path + leaderboard sync
  -> lib/api.ts for typed requests and structured client-side error handling

FastAPI backend
  -> security.py for guest token issuance and auth validation
  -> rate_limit.py for per-route rate limiting
  -> observability.py for request IDs and structured event logging
  -> gemini.py for live model generation
  -> guided_engine.py for deterministic grounded fallback logic
  -> persistence.py for file-backed learner state and leaderboard

AI/content layer
  -> chat responses include direct answer, explanation, action steps, example, next action
  -> citations come from trusted public election sources
  -> adaptive path responds to low-score revision signals and high-score unlock signals
```

## Core Features

- Profile-aware learning modes: `first_time_voter`, `beginner`, `advanced`
- End-to-end election timeline from registration to results
- Scenario coaching for realistic learner blockers
- Chat with:
  - direct answer
  - detailed explanation
  - visible sources
  - smart suggestions
  - ELI10 mode
  - guided fallback behavior
- Quiz mode with strong selection feedback and post-submit explanations
- Adaptive learning path driven by quiz scores and completed steps
- Persistent learning score, personalized path, and leaderboard
- Structured request, error, and rate-limit observability

## Repository Layout

```text
.
|-- .github/workflows/
|   |-- ci.yml
|   `-- deploy.yml
|-- backend/
|   |-- app/
|   |   |-- data.py
|   |   |-- gemini.py
|   |   |-- guided_engine.py
|   |   |-- logging_config.py
|   |   |-- main.py
|   |   |-- models.py
|   |   |-- observability.py
|   |   |-- persistence.py
|   |   |-- rate_limit.py
|   |   `-- security.py
|   |-- tests/
|   |-- requirements.txt
|   `-- requirements-dev.txt
`-- frontend/
    |-- app/
    |-- components/
    |-- hooks/
    |-- lib/
    `-- tests/
```

## API Overview

### `POST /auth/guest`

Issues a short-lived guest bearer token.

Request:

```json
{
  "profile": "beginner"
}
```

Response:

```json
{
  "access_token": "token",
  "token_type": "bearer",
  "user_id": "learner-abc123",
  "expires_at": "2026-04-28T18:00:00Z"
}
```

### `GET /timeline`

Returns the ordered election learning steps.

### `POST /chat`

Creates a grounded assistant response.

Request:

```json
{
  "profile": "beginner",
  "topic_id": "registration",
  "action": "explain",
  "eli10": false,
  "scenario_id": null,
  "completed_steps": ["registration"],
  "user_input": "How do I verify that I can vote?"
}
```

Response shape:

```json
{
  "topic_id": "registration",
  "title": "Registration",
  "action": "explain",
  "preferred_version": "standard",
  "standard": {
    "answer": "Direct answer sentence",
    "simple_explanation": "Deeper explanation",
    "steps": ["Action 1", "Action 2", "Action 3", "Action 4"],
    "real_life_example": "Specific real-world example",
    "what_to_do_next": "Next action"
  },
  "eli10_version": {
    "answer": "Simple direct answer",
    "simple_explanation": "Very simple explanation",
    "steps": ["Simple step 1", "Simple step 2", "Simple step 3", "Simple step 4"],
    "real_life_example": "Simple example",
    "what_to_do_next": "Simple next action"
  },
  "journey_guidance": "Personalized guidance",
  "smart_suggestions": [],
  "citations": [
    {
      "title": "USAGov: Confirm your voter registration",
      "url": "https://www.usa.gov/confirm-voter-registration",
      "note": "Federal guidance for checking registration status.",
      "publisher": "USAGov",
      "trust_label": "Federal guidance"
    }
  ],
  "source": "gemini"
}
```

### `POST /quiz`

Generates a topic quiz.

```json
{
  "profile": "beginner",
  "topic_id": "voting",
  "count": 3,
  "eli10": false
}
```

### `POST /progress`

Returns learner progress plus adaptive learning guidance.

```json
{
  "profile": "beginner",
  "current_topic_id": "campaign",
  "completed_steps": ["registration", "nomination"],
  "quiz_scores": {
    "registration": 3,
    "nomination": 1
  }
}
```

Response includes:

- `personalized_path`
- `adaptive_path.status` as `revise`, `continue`, or `advance`
- `adaptive_path.unlocked_topics`
- `learning_score`

### `GET /leaderboard`

Returns the top learners plus `current_user_rank`.

### `GET /health`

Health endpoint for readiness checks.

## Structured Error Responses

All protected endpoints return structured errors that the frontend can turn into intelligent fallbacks.

Example:

```json
{
  "error": "rate_limit_exceeded",
  "message": "That action is temporarily cooling down to keep the assistant responsive for everyone.",
  "user_action": "Wait a moment, then retry with a narrower follow-up or continue with the local guidance already on screen.",
  "suggestions": [
    "Review the current explanation and sources while the timer resets.",
    "Retry after the cooldown shown below."
  ],
  "request_id": "0f8f7f3f-1f67-4b14-8c58-495d77b5f2aa",
  "retry_after_seconds": 23
}
```

## Local Setup

### Backend

PowerShell:

```powershell
cd backend
python -m venv ..\.venv
& ..\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
```

Create `backend/.env`:

```env
GOOGLE_API_KEY=your-key
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_ORIGINS=http://localhost:3000
APP_AUTH_SECRET=change-me
PUBLIC_CLIENT_ID=election-copilot-web
LOG_LEVEL=INFO
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=45
RATE_LIMIT_CHAT_REQUESTS=25
RATE_LIMIT_QUIZ_REQUESTS=12
RATE_LIMIT_AUTH_REQUESTS=8
```

Run the API:

```powershell
cd backend
& ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

### Frontend

```powershell
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_CLIENT_ID=election-copilot-web
```

Run the app:

```powershell
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

### Backend

```powershell
.\.venv\Scripts\python.exe -m pytest backend\tests -p no:cacheprovider
```

### Frontend lint

```powershell
cd frontend
npm run lint
```

### Frontend unit tests

```powershell
cd frontend
npm run test
```

### Frontend E2E

```powershell
cd frontend
npm run test:e2e
```

### Production build

```powershell
cd frontend
npm run build
```

## CI/CD

### CI workflow

`.github/workflows/ci.yml` runs:

- backend pytest
- frontend lint
- frontend production build
- frontend Vitest unit tests
- Playwright E2E tests

### Deployment workflow

`.github/workflows/deploy.yml` performs:

1. Build and push the FastAPI backend image to Google Artifact Registry.
2. Deploy the backend to Cloud Run.
3. Capture the deployed backend URL.
4. Inject that URL into the frontend production environment.
5. Build and deploy the frontend to Vercel.

Required secrets:

- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`
- `GCP_PROJECT_ID`
- `GCP_ARTIFACT_REPOSITORY`
- `CLOUD_RUN_SERVICE`
- `CLOUD_RUN_REGION`
- `GOOGLE_API_KEY`
- `GEMINI_MODEL`
- `FRONTEND_ORIGINS`
- `APP_AUTH_SECRET`
- `PUBLIC_CLIENT_ID`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `PRODUCTION_API_URL`

## Observability

The backend writes structured JSON logs to stdout. Three categories matter most:

- Request logs
- Error logs
- Rate-limit logs

Example request log:

```json
{
  "timestamp": "2026-04-28T13:12:11.114Z",
  "level": "INFO",
  "logger": "election_copilot.api",
  "message": "request_completed",
  "event": "request_completed",
  "request_id": "3d8f96f7-48a8-4cd6-a26f-6f5d0c8fef8d",
  "path": "/chat",
  "method": "POST",
  "status_code": 200,
  "duration_ms": 412.87,
  "client_ip": "203.0.113.10"
}
```

Example domain log:

```json
{
  "timestamp": "2026-04-28T13:12:11.119Z",
  "level": "INFO",
  "logger": "election_copilot.api",
  "message": "chat_response_created",
  "event": "chat_response_created",
  "request_id": "3d8f96f7-48a8-4cd6-a26f-6f5d0c8fef8d",
  "details": {
    "topic_id": "registration",
    "action": "explain",
    "source": "gemini",
    "citations_count": 3
  }
}
```

Example rate-limit log:

```json
{
  "timestamp": "2026-04-28T13:13:04.002Z",
  "level": "WARNING",
  "logger": "election_copilot.rate_limit",
  "message": "rate_limit_exceeded",
  "event": "rate_limit_exceeded",
  "request_id": "9b827737-f1f0-4696-b17a-d3fc0f6ab767",
  "details": {
    "path": "/chat",
    "method": "POST",
    "client_ip": "203.0.113.10",
    "limit": 25,
    "retry_after_seconds": 23
  }
}
```

### How to view logs locally

Run the backend and stream logs in the same terminal:

```powershell
cd backend
& ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

If you want to pretty-print saved logs in PowerShell:

```powershell
Get-Content .\backend.log | ForEach-Object { $_ | ConvertFrom-Json } | Format-Table timestamp, level, message, path, status_code
```

## Security

- Bearer-token guest sessions for protected flows
- Client ID validation for guest token issuance
- Input sanitization before prompt construction
- Per-route rate limiting with cooldown hints
- Structured protected-route error handling
- Live-model fallback to deterministic local guidance
- CORS restricted to configured frontend origins

## Trusted Source Strategy

Chat responses always attach 2-3 trusted public references selected from official sources such as:

- Vote.gov
- USAGov
- U.S. Election Assistance Commission
- Federal Election Commission

This gives judges something important to inspect: the system does not just answer, it shows where the answer came from.

## Verification Status

The following checks passed after the latest upgrade:

- `.\.venv\Scripts\python.exe -m pytest backend\tests -p no:cacheprovider`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- `cd frontend && npm run test`
- `cd frontend && npm run test:e2e`

## Final Polish Checklist

- UI clarity: answer-first chat layout, visible sources, adaptive insights cards, and stronger empty states
- Error handling: structured API errors, guided fallbacks, visible notices, and toast feedback
- Responsiveness: desktop sidebar, mobile nav, and grid layouts tuned for dense but readable screens
- Performance: static Next.js pages, lazy-loaded views, and lightweight local fallbacks for degraded conditions
- Demo flow: one-click demo mode, highlighted next action, scenario walkthrough, quiz trigger, and insights closeout
