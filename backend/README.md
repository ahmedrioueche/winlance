# Winlance Backend

## Quick start

### Option A — Docker (recommended)

1. Copy `.env.example` to `.env`.
2. Start services: `docker compose up --build`
3. Migrate inside the web container:
   - `docker compose exec web python manage.py migrate`

### Option B — Local Python + Docker Postgres

1. Copy `.env.example` to `.env` (`POSTGRES_HOST=localhost`).
2. Start only the database: `docker compose up -d db`
3. Install deps: `pip install -r requirements/dev.txt`
4. Migrate: `python manage.py migrate`
5. Run: `python manage.py runserver`

## Demo accounts

Set `DEMO_ACCOUNTS_ENABLED=True` in `.env`. Accounts are seeded automatically after migrate, or run:

- `python manage.py seed_demo_accounts`

| Email | Password |
| --- | --- |
| `demo@winlance.local` | `DemoPass123!` |
| `client@winlance.local` | `DemoPass123!` |

Use `python manage.py seed_demo_accounts --remove` to delete demo users.

## Docker

- Dev: `docker compose up --build`
- Prod: `docker compose -f docker-compose.prod.yml up --build`
  - Requires strong `SECRET_KEY` and non-empty `ALLOWED_HOSTS` in `.env`
  - Sets `DJANGO_SETTINGS_MODULE=config.settings.prod`

## CI & tests

- Local: `python manage.py test` (uses `config.settings.test`)
- Optional helpers: `pytest` (`pytest.ini`), `docker compose -f docker-compose.test.yml up -d`
- GitHub Actions: `.github/workflows/ci.yml` runs the Django test suite on backend changes

## Production hardening notes

- Throttles: anon/user defaults plus scoped `auth` and `portal` rates
- Readiness: `GET /api/v1/health/ready/` (DB + cache)
- Backups: `python scripts/backup_postgres.py` (needs `pg_dump`) or `docker compose exec db pg_dump ...`
- Optional Sentry: set `SENTRY_DSN` (uses `sentry-sdk` from `requirements/prod.txt`)
