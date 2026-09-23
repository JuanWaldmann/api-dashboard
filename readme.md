# API Integration Dashboard

A backend service demonstrating clean, resilient API consumption — built with Express and TypeScript, integrating third-party REST APIs (GitHub now, OpenWeather planned) behind a consistent internal interface.

## What it does

- Fetches GitHub repo/user data via Bearer token auth
- Retries failed requests with exponential backoff — 5xx only, since 4xx errors won't resolve by retrying
- Validates response status before trusting the body, so a failed request is never parsed as valid data
- Parses GitHub's `Link` pagination header into clean next/prev/first/last URLs
- Returns rate-limit info as structured data, not pre-formatted strings
- Validates/narrows route and query params at the edge, before they reach service logic

## Architecture

```
Client ─▶ Route handler ─▶ validate params ─▶ service function
                                                    │
                                    fetchWithRetry() — retries 5xx w/ backoff
                                    checkResponseOk() — throws on non-2xx
                                                    │
                                          reshape → JSON response
```

`fetchWithRetry` and `checkResponseOk` live in a shared `services/httpUtils.ts`, not in any one API's service file — they're protocol-level, meant to be reused across every API this project integrates.

## Tech stack

Node.js + TypeScript, Express (`Router()`), native `fetch`, `tsc --noEmit` for type checking (Node runs `.ts` files directly). No database or frontend yet — deliberately backend-only, to focus on the API-consumption layer.

## Key design decisions

- **Retry as a higher-order function** — `fetchWithRetry` takes a `() => fetch(...)` closure, not a URL, so any service can reuse it without it knowing request specifics
- **Only retry what can plausibly succeed on retry** — 5xx only; 4xx errors are retried-proof by nature
- **Retrying and validating are separate concerns** — `fetchWithRetry` just returns a `Response`; `checkResponseOk` decides if that response is usable
- **Structured data, not display strings** — formatting is a presentation concern for later, not baked into the API layer
- **Validate at the edge** — route handlers narrow Express's loose `string | string[] | undefined` types before service functions ever see them
- **Internal camelCase, regardless of the source API** — GitHub's snake_case gets reshaped, not passed through

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/github/repos/:user/:repo` | Single repository details |
| `GET` | `/api/github/users/:user/repos` | User's repos, optional `?page=` / `?per_page=` |

## Running it locally

```
git clone https://github.com/juanwaldmann/api-dashboard.git
cd api-dashboard
npm install
```

Create `.env`:
```
GITHUB_SECRET=your_github_personal_access_token
```

Run:
```
node index.ts
```

## What I'd add next

- OpenWeather integration, reusing the same retry/validation layer (auth via API key in URL rather than Bearer token; its `timeline`/`step` params control granularity, not pagination)
- Rate-limit-aware handling for `429`
- Normalizing query param naming (currently accepts GitHub's own `per_page` snake_case directly)
- A frontend, once the integration layer is solid

## What I learned

Tracing `fetchWithRetry` by hand mattered more than writing it — understanding why a fetch call has to happen fresh each loop iteration, why a 503 is a "successful" HTTP response and not a thrown error, and why "was this retryable" and "was this usable" need to be separate checks. Also spent real time on TypeScript's stricter checking (`noUncheckedIndexedAccess`, Express's loose `req.query` types) — learning to narrow values explicitly instead of widening a function's signature to dodge the error.

Built without AI-generated code — every function written and understood line by line, with AI used strictly as a Socratic reviewer.