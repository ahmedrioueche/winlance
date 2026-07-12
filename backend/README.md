# Winlance Backend

## Quick start

1. Copy `.env.example` to `.env` and adjust environment values.
2. Install dependencies:
   - `pip install -r requirements/dev.txt`
3. Run migrations:
   - `python manage.py migrate`
4. Start the development server:
   - `python manage.py runserver`

## Docker

- `docker compose up --build`
- `docker compose -f docker-compose.prod.yml up --build`
