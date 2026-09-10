# SamudraDrishti High-Performance Oceanographic Backend
FROM python:3.11-slim

# Avoid writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/server

WORKDIR /app

# Install system utilities (curl for container health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python scientific dependencies
COPY server/requirements.txt /app/server/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/server/requirements.txt

# Copy server application and ocean datasets
COPY server /app/server

# Expose API port
EXPOSE 8000

WORKDIR /app/server

# Support dynamic $PORT assigned by cloud providers (Render, Railway, Cloud Run)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]

