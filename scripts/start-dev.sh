#!/bin/sh

set -e

echo "Waiting for database..."

# Optional if using healthchecks
sleep 5

echo "Running migrations..."
alembic upgrade head

echo "Running seeds..."
python -m app.scripts.seeding.seed_all

echo "Starting API..."

exec python -Xfrozen_modules=off -m debugpy \
    --listen 0.0.0.0:5678 \
    -m uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload