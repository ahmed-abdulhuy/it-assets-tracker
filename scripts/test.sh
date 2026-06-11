#!/bin/sh
set -e
echo "Running integration tests..."

echo "Cleaning up any existing test containers..."
docker compose -f docker-compose.test.yml down --volumes --remove-orphans

echo "Starting test containers..."
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit