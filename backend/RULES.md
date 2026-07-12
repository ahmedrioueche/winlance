# Winlance — Backend Rules

Engineering conventions for the Winlance backend. Applies to all backend code, whether written by a human or an AI assistant. If a change conflicts with this file, the file wins — update the file first, then the code.

## Stack

| Concern                   | Choice                                                            |
| ------------------------- | ----------------------------------------------------------------- |
| Language / Framework      | Python, Django + Django REST Framework                            |
| Database                  | PostgreSQL                                                        |
| Cache / short-lived state | Redis                                                             |
| Task queue broker         | RabbitMQ                                                          |
| Async task runner         | Celery (worker + beat), broker = RabbitMQ, result backend = Redis |
| Containerization          | Docker                                                            |
| Local orchestration       | Docker Compose                                                    |
| Web server (prod)         | Gunicorn behind Nginx                                             |

Do not introduce a different ORM, task queue, cache, or broker without updating this file first.

## Project Structure

```
backend/
  config/                  # Django project (settings, urls, wsgi/asgi, celery.py)
    settings/
      base.py
      dev.py
      prod.py
      test.py
  apps/
    accounts/               # auth, users
    leads/                  # Find Leads + Lead CRM
    outreach/                # Marketing Guide content, sequences
    proposals/               # Proposal Generator
    contracts/               # Contract Generator
    projects/                # Project Tracker / Client Portal
    ai_coach/                 # AI Sales Coach
    analytics/                # Funnel + reporting
    core/                     # shared utilities, base models, permissions
  requirements/
    base.txt
    dev.txt
    prod.txt
  manage.py
docker/
  django/Dockerfile
  nginx/
    Dockerfile
    nginx.conf
docker-compose.yml
docker-compose.prod.yml
.env.example
```

Each Django app under `apps/` maps to one product module from `PROJECT.md`. Do not create cross-cutting apps for "misc" logic — put it in `core`.

## App (Django) Rules

- One app = one bounded concept (leads, proposals, contracts, etc.), matching `PROJECT.md` modules. Don't let an app grow to cover two modules.
- Every app has: `models.py` (or `models/` package if large), `serializers.py`, `views.py`, `urls.py`, `services.py`, `tasks.py` (Celery tasks, only if needed), `tests/`.
- Business logic goes in `services.py`, not in views or serializers. Views/serializers stay thin — validate input, call a service, return output.
- Models are the source of truth for data shape. No business logic that mutates cross-model state directly inside `save()` overrides beyond simple field derivation.
- Use Django REST Framework `ViewSet`/`GenericAPIView` classes, not raw function-based views, unless the endpoint is trivial (health check, webhook).

## Database (PostgreSQL)

- All schema changes go through Django migrations. Never hand-edit the database in a running environment.
- One migration per logical change. Don't squash unrelated model changes into a single migration.
- Every model gets: `created_at`, `updated_at` (via a shared `TimeStampedModel` base in `core`).
- Use `UUIDField` (not auto-incrementing int) for primary keys on any model that will be referenced in URLs or exposed to clients (leads, proposals, contracts, projects) — auto-increment ints are fine for internal-only lookup tables.
- Foreign keys default to `on_delete=models.PROTECT` unless there's a clear reason to cascade (e.g., deleting a Lead should cascade its Notes).
- No raw SQL unless there's a proven performance reason, and if so, isolate it in `services.py` behind a normal Python function, with a comment explaining why the ORM wasn't used.
- Add `db_index=True` on any field used in a `filter()`/`order_by()` in the codebase (lead status, user foreign keys, timestamps used for sorting).

## Redis

Used for two distinct purposes — keep them logically separate even though it's one Redis instance in dev:

1. **Cache** (Django cache framework) — view/query caching, rate limiting counters.
2. **Celery result backend** — task results and state.

Rules:

- Use Django's cache API (`django.core.cache`), never a raw `redis-py` client scattered through app code — one wrapper in `core/cache.py` if custom behavior is needed.
- Always set a timeout on cache keys. No permanent cache entries.
- Session storage can live in Redis (`django-redis` cache-based sessions) once auth is implemented — don't use signed cookies for session state beyond the session id.

## RabbitMQ + Celery

RabbitMQ is the broker; Celery is the only thing that talks to it directly.

- Anything slower than ~200ms or anything that calls an external API (AI Sales Coach requests, proposal AI-customization, email sending, PDF generation for contracts) is a Celery task, not inline in a request/response cycle.
- Tasks live in each app's `tasks.py`. Task names are namespaced: `leads.tasks.score_lead`, `proposals.tasks.generate_ai_draft`.
- Tasks must be idempotent — safe to retry. Use `task.retry()` with exponential backoff for transient failures (e.g., third-party API timeouts).
- Long-running or scheduled jobs (e.g., nightly analytics rollups) go through Celery Beat, defined in `config/celery.py`, not cron inside the container.
- Never put a Celery task call inside a DB transaction that hasn't committed yet — trigger tasks via `transaction.on_commit(...)`.

## Docker & Docker Compose

### Services (`docker-compose.yml`, local dev)

```yaml
services:
  web: # Django + Gunicorn (or runserver in dev)
  worker: # Celery worker
  beat: # Celery beat scheduler
  db: # postgres:16
  redis: # redis:7
  rabbitmq: # rabbitmq:3-management
  nginx: # only in prod compose, not needed for local dev
```

Rules:

- One `Dockerfile` for the Django image, shared by `web`, `worker`, and `beat` (different `command:` per service, same image).
- Dev and prod are separate compose files: `docker-compose.yml` (dev, with hot reload / volume mounts) and `docker-compose.prod.yml` (prod, no source volume mounts, Gunicorn, Nginx in front).
- All configuration comes from environment variables, loaded via `.env` (dev) — never bake secrets into the image or commit `.env`. Commit `.env.example` with every required key and a dummy value.
- Postgres and Redis data are named volumes, not bind mounts, so `docker compose down` doesn't nuke local data unless `-v` is explicit.
- Healthchecks required on `db`, `redis`, and `rabbitmq`; `web`, `worker`, and `beat` should `depends_on` those with `condition: service_healthy`.
- Never run `python manage.py runserver` in the prod image — Gunicorn only.

## Environment / Settings

- `config/settings/base.py` holds shared settings; `dev.py`/`prod.py`/`test.py` import from `base` and override.
- All secrets and environment-specific values (DB creds, `SECRET_KEY`, broker URL, Redis URL, third-party API keys) come from environment variables via `django-environ` — no secrets committed anywhere, including `dev.py`.
- `DJANGO_SETTINGS_MODULE` is set per-environment in Docker Compose, not hardcoded in `manage.py`.

## API Conventions

- REST, JSON only. URL structure: `/api/v1/<resource>/`.
- Versioned from day one (`/api/v1/`) even though there's only one version now.
- Pagination on every list endpoint (DRF `PageNumberPagination`, default page size 25).
- Consistent error shape:
  ```json
  { "error": { "code": "string", "message": "human readable" } }
  ```
- Auth via JWT (`djangorestframework-simplejwt`) — access + refresh token pattern. No session-auth-only endpoints for the API surface used by the frontend.

## Testing

- `pytest` + `pytest-django`, not Django's built-in `TestCase` runner directly (though `TestCase`-style classes are fine under pytest).
- Every service function in `services.py` gets a unit test. Every endpoint gets at least one integration test (happy path + one failure path).
- Celery tasks are tested with `task.apply()` (eager, synchronous) in tests — never require a live broker for the test suite.
- CI must be able to run the full test suite via `docker compose -f docker-compose.test.yml run web pytest` with no manual setup steps.

## What NOT to do

- No business logic in Django admin `save_model` overrides — admin is for inspection/manual overrides, not core flows.
- No calling external AI APIs (proposal customization, AI Sales Coach) synchronously inside a request — always via Celery.
- No app importing directly from another app's `models.py` internals beyond straightforward FK relations — cross-app orchestration goes through `services.py`, so app boundaries stay real.
- No committing `.env`, credentials, or database dumps to the repo.
- No skipping migrations by editing the DB directly, even "just this once" in dev.
