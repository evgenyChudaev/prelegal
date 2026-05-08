# syntax=docker/dockerfile:1.7

# ---- Frontend build stage ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Backend runtime stage ----
FROM python:3.12-slim AS runtime
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never \
    PRELEGAL_DB_PATH=/tmp/prelegal.db

WORKDIR /app
RUN pip install --no-cache-dir uv

COPY backend/pyproject.toml ./
RUN uv sync

COPY backend/app ./app
COPY --from=frontend-builder /app/frontend/out ./static

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
