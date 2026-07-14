FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DJANGO_SETTINGS_MODULE=config.settings.prod \
    PORT=8000

WORKDIR /app

COPY requirements/ ./requirements/
RUN pip install --upgrade pip && pip install -r requirements/prod.txt

COPY . .

EXPOSE 8000

# Render injects PORT; local/compose default to 8000.
CMD ["sh", "-c", "gunicorn config.wsgi:application --bind 0.0.0.0:${PORT} --workers 3"]
