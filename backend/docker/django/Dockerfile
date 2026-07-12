FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements/ ./requirements/
RUN pip install --upgrade pip && pip install -r requirements/requirements.txt

COPY . .
